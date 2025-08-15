import { performance } from 'perf_hooks';

/**
 * Performance testing utilities for questline components
 */
export class PerformanceTester {
  private measurements: { [key: string]: number[] } = {};

  /**
   * Start measuring performance for a named operation
   */
  startMeasurement(name: string): void {
    performance.mark(`${name}-start`);
  }

  /**
   * End measurement and record the time
   */
  endMeasurement(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration || 0;

    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);

    return duration;
  }

  /**
   * Get statistics for a measurement
   */
  getStats(name: string) {
    const measurements = this.measurements[name] || [];
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, total: 0 };
    }

    const total = measurements.reduce((sum, val) => sum + val, 0);
    const avg = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements = {};
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Assert that average performance meets requirements
   */
  assertPerformance(name: string, maxAvgMs: number): void {
    const stats = this.getStats(name);
    if (stats.avg > maxAvgMs) {
      throw new Error(
        `Performance assertion failed for "${name}": ` +
        `Average time ${stats.avg}ms exceeds limit of ${maxAvgMs}ms`
      );
    }
  }
}

/**
 * Memory testing utilities
 */
export class MemoryTester {
  private initialMemory: number = 0;

  /**
   * Record initial memory usage
   */
  recordInitialMemory(): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    this.initialMemory = this.getCurrentMemoryUsage();
  }

  /**
   * Get current memory usage (in MB)
   */
  getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize / 1024 / 1024;
    }

    // Fallback for Node environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }

    return 0;
  }

  /**
   * Check for memory leaks
   */
  checkForMemoryLeak(thresholdMB: number = 50): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const currentMemory = this.getCurrentMemoryUsage();
    const memoryIncrease = currentMemory - this.initialMemory;

    if (memoryIncrease > thresholdMB) {
      throw new Error(
        `Memory leak detected: Memory increased by ${memoryIncrease.toFixed(2)}MB ` +
        `(threshold: ${thresholdMB}MB)`
      );
    }
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityTester {
  /**
   * Check if element is keyboard accessible
   */
  static isKeyboardAccessible(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute('tabindex');
    const role = element.getAttribute('role');

    // Check if element is focusable
    const focusableElements = [
      'button', 'input', 'select', 'textarea', 'a'
    ];

    const isFocusable =
      focusableElements.includes(element.tagName.toLowerCase()) ||
      tabIndex !== null ||
      role === 'button' ||
      element.hasAttribute('onclick');

    return isFocusable;
  }

  /**
   * Check if element has appropriate ARIA labels
   */
  static hasProperARIA(element: HTMLElement): boolean {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const altText = element.getAttribute('alt');

    // Interactive elements should have some form of accessible name
    if (this.isKeyboardAccessible(element)) {
      return !!(ariaLabel || ariaLabelledBy || title || altText);
    }

    return true;
  }

  /**
   * Check color contrast (simplified)
   */
  static hasGoodContrast(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    // This is a simplified check - in production, you'd use a proper
    // contrast ratio calculation library
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
      return true; // Can't determine contrast for transparent backgrounds
    }

    // Basic checks for common high-contrast combinations
    const highContrastCombos = [
      ['rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
      ['rgb(0, 0, 0)', 'rgb(255, 255, 255)'],
    ];

    return highContrastCombos.some(([bg, fg]) =>
      (backgroundColor.includes(bg) && color.includes(fg)) ||
      (backgroundColor.includes(fg) && color.includes(bg))
    );
  }

  /**
   * Run comprehensive accessibility audit on element
   */
  static auditElement(element: HTMLElement): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check keyboard accessibility
    if (!this.isKeyboardAccessible(element) && element.onclick) {
      issues.push('Element has click handler but is not keyboard accessible');
    }

    // Check ARIA
    if (!this.hasProperARIA(element)) {
      issues.push('Element lacks proper ARIA labeling');
    }

    // Check for focus outline
    const styles = window.getComputedStyle(element);
    if (this.isKeyboardAccessible(element) &&
        styles.outline === 'none' &&
        styles.outlineStyle === 'none') {
      issues.push('Focusable element has no visible focus indicator');
    }

    // Check for sufficient size (minimum 44x44px for touch targets)
    const rect = element.getBoundingClientRect();
    if (this.isKeyboardAccessible(element) &&
        (rect.width < 44 || rect.height < 44)) {
      issues.push('Interactive element is smaller than minimum touch target size (44x44px)');
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}

/**
 * Load testing utilities for questline components
 */
export class LoadTester {
  /**
   * Simulate rendering many questlines concurrently
   */
  static async stressTestRendering(
    renderFunction: () => void,
    iterations: number = 100
  ): Promise<{
    totalTime: number;
    averageTime: number;
    failures: number;
  }> {
    const startTime = performance.now();
    let failures = 0;

    const promises = Array.from({ length: iterations }, async () => {
      try {
        renderFunction();
      } catch (error) {
        failures++;
        console.error('Render failure:', error);
      }
    });

    await Promise.all(promises);

    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / iterations;

    return {
      totalTime: Math.round(totalTime * 100) / 100,
      averageTime: Math.round(averageTime * 100) / 100,
      failures
    };
  }

  /**
   * Test component with large datasets
   */
  static generateLargeQuestlineData(questCount: number) {
    return {
      questlineId: 'stress-test-questline',
      frameSize: { width: 2000, height: 2000 },
      background: { exportUrl: 'background.png' },
      quests: Array.from({ length: questCount }, (_, i) => ({
        questKey: `stress-quest-${i}`,
        stateBounds: {
          locked: {
            x: (i % 20) * 100,
            y: Math.floor(i / 20) * 100,
            w: 80,
            h: 60
          },
          active: {
            x: (i % 20) * 100 + 5,
            y: Math.floor(i / 20) * 100 + 5,
            w: 85,
            h: 65
          },
          unclaimed: {
            x: (i % 20) * 100 + 10,
            y: Math.floor(i / 20) * 100 + 10,
            w: 90,
            h: 70
          },
          completed: {
            x: (i % 20) * 100 + 15,
            y: Math.floor(i / 20) * 100 + 15,
            w: 95,
            h: 75
          }
        },
        lockedImg: `stress-quest-${i}_locked.png`,
        activeImg: `stress-quest-${i}_active.png`,
        unclaimedImg: `stress-quest-${i}_unclaimed.png`,
        completedImg: `stress-quest-${i}_completed.png`
      })),
      exportedAt: new Date().toISOString(),
      metadata: {
        totalQuests: questCount,
        version: '1.0.0'
      }
    };
  }
}

/**
 * Error boundary testing utilities
 */
export class ErrorBoundaryTester {
  /**
   * Test component error handling
   */
  static testErrorRecovery(
    renderFunction: (shouldError: boolean) => void,
    cleanup: () => void
  ): {
    recoveredGracefully: boolean;
    error?: Error;
  } {
    try {
      // First render normally
      renderFunction(false);

      // Then trigger an error
      renderFunction(true);

      // Then try to recover
      renderFunction(false);

      cleanup();

      return { recoveredGracefully: true };
    } catch (error) {
      cleanup();
      return {
        recoveredGracefully: false,
        error: error as Error
      };
    }
  }
}

// Export all testers
export const testingUtils = {
  PerformanceTester,
  MemoryTester,
  AccessibilityTester,
  LoadTester,
  ErrorBoundaryTester
};
