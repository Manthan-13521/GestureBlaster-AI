import type { Vector2 } from "@/types/common";

export interface CameraDimensions {
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export class CoordinateMapper {
  private camera: CameraDimensions;
  private viewport: ViewportDimensions;

  constructor(camera: CameraDimensions, viewport: ViewportDimensions) {
    this.camera = camera;
    this.viewport = viewport;
  }

  resize(viewport: ViewportDimensions): void {
    this.viewport = viewport;
  }

  private getCoverVisibleRegion(): {
    offsetX: number;
    offsetY: number;
    scale: number;
  } {
    const cameraAspect = this.camera.width / this.camera.height;
    const viewportAspect = this.viewport.width / this.viewport.height;

    if (cameraAspect > viewportAspect) {
      const scale = this.viewport.height / this.camera.height;
      const visibleWidth = this.camera.width * scale;
      const offsetX = (this.viewport.width - visibleWidth) / 2;
      return { offsetX, offsetY: 0, scale };
    } else {
      const scale = this.viewport.width / this.camera.width;
      const visibleHeight = this.camera.height * scale;
      const offsetY = (this.viewport.height - visibleHeight) / 2;
      return { offsetX: 0, offsetY, scale };
    }
  }

  mirrorX(normalizedX: number): number {
    return 1 - normalizedX;
  }

  mapToViewport(normalizedX: number, normalizedY: number): Vector2 {
    const mirroredX = this.mirrorX(normalizedX);
    const region = this.getCoverVisibleRegion();

    const viewportX = mirroredX * this.camera.width * region.scale + region.offsetX;
    const viewportY = normalizedY * this.camera.height * region.scale + region.offsetY;

    return { x: viewportX, y: viewportY };
  }

  mapToCanvas(
    normalizedX: number,
    normalizedY: number,
    canvasWidth: number,
    canvasHeight: number,
  ): Vector2 {
    const viewport = this.mapToViewport(normalizedX, normalizedY);

    const canvasX = (viewport.x / this.viewport.width) * canvasWidth;
    const canvasY = (viewport.y / this.viewport.height) * canvasHeight;

    return { x: canvasX, y: canvasY };
  }
}
