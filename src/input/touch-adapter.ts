import type { Vector2 } from "@/types/common";

export class TouchAdapter {
  private current: Vector2 = { x: 0, y: 0 };
  private _isActive: boolean = false;
  private element: HTMLElement | null = null;
  private activeTouchId: number | null = null;

  get isActive(): boolean {
    return this._isActive;
  }

  get position(): Vector2 {
    return this.current;
  }

  private onTouchStart = (e: TouchEvent) => {
    if (this.activeTouchId !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    this.activeTouchId = touch.identifier;
    this.current = { x: touch.clientX, y: touch.clientY };
    this._isActive = true;
  };

  private onTouchMove = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        this.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        this._isActive = false;
        this.activeTouchId = null;
        break;
      }
    }
  };

  attach(element: HTMLElement): void {
    this.element = element;
    element.addEventListener("touchstart", this.onTouchStart, { passive: true });
    element.addEventListener("touchmove", this.onTouchMove, { passive: true });
    element.addEventListener("touchend", this.onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
  }

  detach(): void {
    if (this.element) {
      this.element.removeEventListener("touchstart", this.onTouchStart);
      this.element.removeEventListener("touchmove", this.onTouchMove);
      this.element.removeEventListener("touchend", this.onTouchEnd);
      this.element.removeEventListener("touchcancel", this.onTouchEnd);
    }
    this.element = null;
    this._isActive = false;
    this.activeTouchId = null;
    this.current = { x: 0, y: 0 };
  }
}
