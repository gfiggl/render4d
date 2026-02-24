 


> Open this page at [https://gfiggl.github.io/render4d/](https://gfiggl.github.io/render4d/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/gfiggl/render4d** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/gfiggl/render4d** and click import

#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>

## Performance notes (zero runtime GC)

This library now includes allocation-free math helpers and a simple `Vec3Pool`.

### Fast path checklist

- Preallocate all temporary vectors at startup (`new render.Vec3Pool(N)`).
- In frame loops, only use `*To`/`InPlace` APIs (`add3To`, `sub3To`, `cross3To`, `normalize3InPlace`, etc.).
- Use packed buffers plus offsets (`dot3At`) for large mesh processing.
- Avoid creating new arrays in shaders; write into caller-provided output buffers.
- Call `pool.reset()` once per frame (or `render.withVec3Frame(pool, ...)`) instead of releasing every object manually.

### Suggested architecture improvements for maximum speed

1. **Struct-of-Arrays (SoA) vertex layout**: Keep positions, normals, UVs in separate numeric arrays to improve cache locality.
2. **Batch draw API**: Add `drawBatch(mesh, material, instanceRange)` to reduce call overhead.
3. **Command buffer**: Record draw commands into preallocated arrays and execute in one pass.
4. **Fixed-point mode option**: In constrained targets, fixed-point math can reduce float overhead.
5. **Shader specialization**: Generate specialized shader functions per material flags to avoid branches in hot loops.
6. **Avoid pool exhaustion**: Track high-water mark and size pools to peak frame usage.

### Ergonomics ideas

- Add typed builders (`MeshBuilder`, `MaterialBuilder`) that allocate only during setup.
- Offer a dual API:
  - easy API (allocating, friendly)
  - performance API (explicit `out` args + pools)
- Include a small runtime profiler hook (`frameAllocations`, `poolAvailable`) for quick tuning.
