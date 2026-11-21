<?php
declare(strict_types=1);

namespace ReaderOps\Screening;

/**
 * Was the test used properly?
 *
 * These record flags. They never block a sale on their own — a human reviews
 * them. A system that silently refuses sales for statistical reasons will be
 * worked around within a week.
 */
final class Integrity
{
    public function __construct(private array $protocol) {}

    public function check(array $p): array
    {
        $flags  = [];
        $trials = $p['trials'] ?? [];
        $total  = array_sum(array_column($trials, 'ms'));

        if ($total < $this->protocol['min_duration_ms']) {
            $flags[] = 'too_fast';
        }

        $pxPerMm = $p['calibration']['pxPerMm'] ?? null;
        if ($pxPerMm === null) {
            $flags[] = 'uncalibrated';
        } elseif ($pxPerMm < 2 || $pxPerMm > 25) {
            $flags[] = 'implausible_calibration';
        }

        $lux = $p['lux'] ?? null;
        if ($lux !== null && ($lux < 50 || $lux > 2000)) {
            $flags[] = 'lighting_out_of_range';
        }

        if (empty($p['distance_aid_used'])) {
            $flags[] = 'no_distance_aid';
        }

        foreach ($trials as $t) {
            if ((int) $t['ms'] < 300) {
                $flags[] = 'trial_too_fast';
            }
            if ((float) ($t['strokePx'] ?? 99) < $this->protocol['min_stroke_px']) {
                $flags[] = 'below_render_floor';
            }
        }

        return array_values(array_unique($flags));
    }
}
