export class ResponsiveUi {
  private static threshold = "768px";
  static mobile = `(max-width: ${this.threshold})`;
  static desktop = `(min-width: ${this.threshold})`;
}

export const device = {
  mobile: `(max-width: 768px)`,
  desktop: `(min-width: 768px)`,
};
