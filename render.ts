namespace render {
    /**
     * Zero-allocation vector utilities and pooling helpers.
     *
     * Keep allocations outside your frame/update loop:
     * - Preallocate vectors once.
     * - Reuse them through pool acquire/release.
     * - Use `*To` methods that write into existing output buffers.
     */

    /** A mutable 3D vector represented by a 3-slot number array. */
    export type Vec3 = number[]

    /**
     * Vertex shader interface optimized for no-GC hot paths.
     *
     * `outData` must be preallocated by the caller and is reused per vertex.
     */
    export interface VertShader {
        (outData: number[], data: number[], norm: number[], uniforms: number[][]): void
    }

    /** Fragment shader; returns a packed 8-bit color. */
    export interface FragShader {
        (data: number): number
    }

    /**
     * Backwards-compatible dot product of the first 3 components.
     * Avoid in hot loops if you can use `dot3At` on packed buffers.
     */
    export function dot(vec1: number[], vec2: number[]) {
        return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]
    }

    /**
     * Backwards-compatible 2D cross (z-component from XY vectors).
     */
    export function cross(vec1: number[], vec2: number[]) {
        return vec1[0] * vec2[1] - vec1[1] * vec2[0]
    }

    /** Writes values into an existing vec3 and returns it. */
    export function set3(out: Vec3, x: number, y: number, z: number): Vec3 {
        out[0] = x
        out[1] = y
        out[2] = z
        return out
    }

    /** Copies one vec3 into another preallocated vec3. */
    export function copy3(out: Vec3, from: Vec3): Vec3 {
        out[0] = from[0]
        out[1] = from[1]
        out[2] = from[2]
        return out
    }

    /** Dot product on packed arrays, no temporary allocations. */
    export function dot3At(a: number[], ai: number, b: number[], bi: number): number {
        return a[ai] * b[bi] + a[ai + 1] * b[bi + 1] + a[ai + 2] * b[bi + 2]
    }

    /** out = a + b */
    export function add3To(out: Vec3, a: Vec3, b: Vec3): Vec3 {
        out[0] = a[0] + b[0]
        out[1] = a[1] + b[1]
        out[2] = a[2] + b[2]
        return out
    }

    /** out = a - b */
    export function sub3To(out: Vec3, a: Vec3, b: Vec3): Vec3 {
        out[0] = a[0] - b[0]
        out[1] = a[1] - b[1]
        out[2] = a[2] - b[2]
        return out
    }

    /** out = v * s */
    export function scale3To(out: Vec3, v: Vec3, s: number): Vec3 {
        out[0] = v[0] * s
        out[1] = v[1] * s
        out[2] = v[2] * s
        return out
    }

    /** out = cross(a, b) */
    export function cross3To(out: Vec3, a: Vec3, b: Vec3): Vec3 {
        const ax = a[0], ay = a[1], az = a[2]
        const bx = b[0], by = b[1], bz = b[2]
        out[0] = ay * bz - az * by
        out[1] = az * bx - ax * bz
        out[2] = ax * by - ay * bx
        return out
    }

    /** Returns squared length of vec3. */
    export function lenSq3(v: Vec3): number {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
    }

    /** Normalizes in place and returns the same vector. */
    export function normalize3InPlace(v: Vec3): Vec3 {
        const lsq = lenSq3(v)
        if (lsq <= 0) return v
        const invLen = 1 / Math.sqrt(lsq)
        v[0] *= invLen
        v[1] *= invLen
        v[2] *= invLen
        return v
    }

    /**
     * Very small fixed-capacity vec3 pool.
     *
     * Usage:
     *   const pool = new render.Vec3Pool(256)
     *   const tmp = pool.acquire()
     *   ...
     *   pool.release(tmp)
     */
    export class Vec3Pool {
        private store: Vec3[]
        private top: number

        constructor(capacity: number) {
            this.store = []
            for (let i = 0; i < capacity; i++) {
                this.store.push([0, 0, 0])
            }
            this.top = capacity
        }

        /**
         * Acquire a vec3 from the pool.
         * If exhausted, returns a fallback `[0,0,0]` (allocates once for this call).
         * Avoid exhaustion in performance-critical loops by sizing pool correctly.
         */
        acquire(): Vec3 {
            if (this.top > 0) {
                this.top--
                return this.store[this.top]
            }
            return [0, 0, 0]
        }

        /** Releases a previously acquired vec3 back to the pool. */
        release(v: Vec3): void {
            if (this.top < this.store.length) {
                this.store[this.top] = v
                this.top++
            }
        }

        /** Resets all allocations for next frame (frame-arena style usage). */
        reset(): void {
            this.top = this.store.length
        }

        /** Number of available vec3 entries right now. */
        available(): number {
            return this.top
        }
    }

    /**
     * Helper to execute a frame with guaranteed pool reset.
     */
    export function withVec3Frame(pool: Vec3Pool, work: () => void): void {
        try {
            work()
        } finally {
            pool.reset()
        }
    }
}
