'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ContributionDay, StreakTheme } from '@/lib/utils/streak';
import { STREAK_THEMES, formatStreakDate } from '@/lib/utils/streak';

interface ContributionGraphProps {
  data: ContributionDay[];
  theme?: StreakTheme;
  onThemeChange?: (theme: StreakTheme) => void;
  showThemeSelector?: boolean;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const DAYS_IN_WEEK = 7;

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function getMonthLabels(data: ContributionDay[]): { label: string; offset: number }[] {
  const months: { label: string; offset: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let lastMonth = -1;
  let weekIndex = 0;

  for (let i = 0; i < data.length; i += DAYS_IN_WEEK) {
    const date = new Date(data[i].date);
    const month = date.getMonth();
    
    if (month !== lastMonth) {
      months.push({
        label: monthNames[month],
        offset: weekIndex * (CELL_SIZE + CELL_GAP),
      });
      lastMonth = month;
    }
    weekIndex++;
  }

  return months;
}

function getLevelColor(level: 0 | 1 | 2 | 3 | 4, theme: StreakTheme): string {
  const baseColor = STREAK_THEMES[theme].color;
  
  switch (level) {
    case 0:
      return '#1f1f1f';
    case 1:
      return `${baseColor}33`;
    case 2:
      return `${baseColor}66`;
    case 3:
      return `${baseColor}99`;
    case 4:
      return baseColor;
    default:
      return '#1f1f1f';
  }
}

export function ContributionGraph({
  data,
  theme = 'github',
  onThemeChange,
  showThemeSelector = false,
}: ContributionGraphProps) {
  const [hoveredCell, setHoveredCell] = useState<ContributionDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const weeks = useMemo(() => {
    const result: ContributionDay[][] = [];
    for (let i = 0; i < data.length; i += DAYS_IN_WEEK) {
      result.push(data.slice(i, i + DAYS_IN_WEEK));
    }
    return result;
  }, [data]);

  const monthLabels = useMemo(() => getMonthLabels(data), [data]);

  const graphWidth = weeks.length * (CELL_SIZE + CELL_GAP) + 30;
  const graphHeight = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 20;

  const handleCellHover = (
    cell: ContributionDay,
    event: React.MouseEvent<SVGRectElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setHoveredCell(cell);
  };

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto pb-2">
        <svg
          width={graphWidth}
          height={graphHeight}
          className="min-w-full"
          role="img"
          aria-label="Contribution graph showing task completions over time"
        >
          {monthLabels.map((month, i) => (
            <text
              key={`month-${i}`}
              x={month.offset + 30}
              y={10}
              className="fill-text-secondary text-[10px]"
            >
              {month.label}
            </text>
          ))}

          {DAY_LABELS.map((label, i) => (
            label && (
              <text
                key={`day-${i}`}
                x={0}
                y={20 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                className="fill-text-secondary text-[10px]"
              >
                {label}
              </text>
            )
          ))}

          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <rect
                key={`${weekIndex}-${dayIndex}`}
                x={30 + weekIndex * (CELL_SIZE + CELL_GAP)}
                y={20 + dayIndex * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={getLevelColor(day.level, theme)}
                className="transition-opacity cursor-pointer hover:opacity-80"
                onMouseEnter={(e) => handleCellHover(day, e)}
                onMouseLeave={() => setHoveredCell(null)}
                role="gridcell"
                aria-label={`${formatStreakDate(new Date(day.date))}: ${day.count} task${day.count !== 1 ? 's' : ''} completed`}
              />
            ))
          )}
        </svg>

        {hoveredCell && (
          <div
            className="fixed z-50 px-2 py-1 text-xs bg-bg-secondary border border-border-default rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <div className="font-medium text-text-primary">
              {hoveredCell.count} task{hoveredCell.count !== 1 ? 's' : ''}
            </div>
            <div className="text-text-secondary">
              {formatStreakDate(new Date(hoveredCell.date))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getLevelColor(level as 0 | 1 | 2 | 3 | 4, theme) }}
            />
          ))}
          <span>More</span>
        </div>

        {showThemeSelector && onThemeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Theme:</span>
            {(Object.keys(STREAK_THEMES) as StreakTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onThemeChange(t)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all',
                  theme === t
                    ? 'border-text-primary scale-110'
                    : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: STREAK_THEMES[t].color }}
                aria-label={`Select ${STREAK_THEMES[t].name} theme`}
                title={STREAK_THEMES[t].name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
