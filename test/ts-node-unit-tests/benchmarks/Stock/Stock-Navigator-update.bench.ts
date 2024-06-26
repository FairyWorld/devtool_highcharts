import type { BenchmarkContext, BenchmarkResult } from '../../benchmark';
import { performance } from 'node:perf_hooks';
import { join } from 'node:path';
import { generateOHLC } from '../../data-generators';
import { setupDOM } from '../../test-utils';


export const config = {
    sizes: [1000, 10_000]
};

export function before(size: number) {

    return {
        fileName: `${size}-ohlc.json`,
        func: generateOHLC.bind(undefined, size)
  };
}

export default async function benchmarkTest(
    {
        size,
        CODE_PATH,
        data
    }: BenchmarkContext
): Promise<BenchmarkResult> {
  const { win, el } = setupDOM();
  const hc = require(join(CODE_PATH, '/highstock.src.js'))(win);

  const chart = hc.stockChart(el, {
    chart: {
        height: 400,
        width: 800
    },
    accessibility: {
      enabled: false
    },
    plotOptions: {
        series: {
            animation: false,
            dataLabels: {
                defer: false
            }
        }
    },
    series: [{
      data: data,
      type: 'candlestick',
      dataGrouping: {
        enabled: true
      }
    }]
  });

  performance.mark('Start');

  for (let i = 0; i < 250; i++) {
    chart.update({
      navigator: {
        maskInside: i % 2 === 0 ? false : true
      }
    });
  };

  performance.mark('End');

  return performance.measure('Start to Now', 'Start', 'End').duration;
}
