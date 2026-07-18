import type { Vector2 } from "@/types/common";

export class MouseAdapter {
  private current: Vector2 = { x: 0, y: 0 };
  private _isActive: boolean = false;
  private element: HTMLElement | null = null;

  get isActive(): boolean {
    return this._isActive;
  }

  get position(): Vector2 {
    return this.current;
  }

  private onMouseMove = (e: MouseEvent) => {
    this.current = { x: e.clientX, y: e.clientY };
    this._isActive = true;
  };

  private onMouseLeave = () => {
    this._isActive = false;
  };

  private onMouseEnter = (e: MouseEvent) => {
    this._isActive = true;
    this.current = { x: e.clientX, y: e.clientY };
  };

  attach(element: HTMLElement): void {
    this.element = element;
    element.addEventListener("mousemove", this.onMouseMove);
    element.addEventListener("mouseleave", this.onMouseLeave);
    element.addEventListener("mouseenter", this.onMouseEnter);
  }

  detach(): void {
    if (this.element) {
      this.element.removeEventListener("mousemove", this.onMouseMove);
      this.element.removeEventListener("mouseleave", this.onMouseLeave);
      this.element.removeEventListener("mouseenter", this.onMouseEnter);
    }
    this.element = null;
    this._isActive = false;
    this.current = { x: 0, y: 0 };
  }
}
