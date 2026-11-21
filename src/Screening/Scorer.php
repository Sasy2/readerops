<?php
declare(strict_types=1);

namespace ReaderOps\Screening;

/**
 * Scores a screening from raw trials.
 *
 * The client sends what was shown and what was answered. Nothing else.
 * Every judgement in here is made on the server, which is what makes the
 * link between a verified screening and a commission mean anything.
 */
final class Scorer
{
    public function __construct(private array $protocol) {}

    public function score(array $payload): array
    {
        $flags = [];

        // 1. Recompute correctness. Never trust a client-sent boolean.
        $byLevel = [];
        foreach ($payload['trials'] as $t) {
            $ok = ((int) $t['shown'] === (int) $t['answer']);
            $byLevel[(int) $t['level']][] = ['ok' => $ok, 'ms' => (int) $t['ms']];
        }

        // 2. Deepest level passed at 3 of 5.
        ksort($byLevel);
        $lastPassed = null;
        foreach ($byLevel as $level => $trials) {
            if (count($trials) < $this->protocol['presentations']) {
                $flags[] = 'incomplete_level';
                break;
            }
            $correct = count(array_filter($trials, static fn ($x) => $x['ok']));
            if ($correct >= $this->protocol['pass_threshold']) {
                $lastPassed = $level;
            } else {
                break;
            }
        }

        // 3. Compare against the impairment threshold.
        if ($lastPassed === null) {
            $outcome = 'REFER';
            $reason  = 'no_level_passed';
        } else {
            $logMAR   = (float) $this->protocol['ladder'][$lastPassed]['logmar'];
            $impaired = $logMAR > (float) $this->protocol['threshold_logmar'];
            $outcome  = $impaired ? 'BUY' : 'NO_CORRECTION_NEEDED';
            $reason   = $impaired ? 'nvi_detected' : 'above_threshold';
        }

        // 4. Gates that override any acuity result, in priority order.
        if ((int) $payload['age'] < 18) {
            $outcome = 'BLOCKED';
            $reason  = 'minor';
        } elseif ((int) $payload['age'] < $this->protocol['min_age']) {
            $outcome = 'REFER';
            $reason  = 'below_min_age';
        } elseif (!empty($payload['red_flags'])) {
            $outcome = 'REFER';
            $reason  = 'red_flag';
        } elseif (!empty($payload['distance_va_fails'])) {
            $outcome = 'REFER';
            $reason  = 'distance_va';
        }

        return [
            'outcome'           => $outcome,
            'reason'            => $reason,
            'last_passed'       => $lastPassed,
            'recommended_power' => $outcome === 'BUY'
                ? $this->recommendedPower((int) $payload['age'])
                : null,
            'protocol_version'  => $this->protocol['version'],
            'flags'             => array_values(array_unique(
                array_merge($flags, (new Integrity($this->protocol))->check($payload))
            )),
        ];
    }

    /** Looked up from the age table, never computed from the acuity score. */
    public function recommendedPower(int $age): ?float
    {
        foreach ($this->protocol['power_table'] as $band) {
            if ($age >= $band['from'] && $age <= $band['to']) {
                return (float) $band['power'];
            }
        }
        return null;  // outside the table: refer, do not guess
    }
}
