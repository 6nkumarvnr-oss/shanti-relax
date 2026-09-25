# How to Create Shanti's `.vrm` Avatar

The app renders a **real 3D talking avatar** when a VRM model exists at
`public/avatar.vrm`. Until then it automatically falls back to the built-in SVG
face — so you can ship today and upgrade the moment the model is ready.

A `.vrm` file cannot be hand-written — it is a rigged 3D humanoid (mesh + bones +
facial expressions) packed in glTF. You create it with a tool. Three routes:

---

## Route A — VRoid Studio (recommended, free, full rights)

Best fit for Shanti: you design the character yourself, so **you own the model and
may use it commercially** (for your own creations).

1. Download **VRoid Studio** (free, Windows/macOS): <https://vroid.com/en/studio>
2. Design Shanti: face, hair, skin tone, saree/kurti-style clothing from the
   wardrobe presets.
3. **Photo Booth** tab → check the facial expressions (aa, blink are auto-generated).
4. Top-right **Export** → **Export as VRM** → choose **VRM 1.0**, reduce
   polygon/material count if offered (target **< 10 MB** for phone loading).
5. Rename the file to `avatar.vrm` and drop it into this repo at
   `public/avatar.vrm`. Commit, push, deploy — done.

No coding, no rigging — VRoid rigs and adds lip-sync expressions automatically.

## Route B — Ready Player Me → Blender convert

1. Create an avatar free at <https://readyplayer.me> → download the `.glb`.
2. Install **Blender 4.x** + the **VRM Add-on for Blender**
   (<https://vrm-addon-for-blender.info>).
3. Import the `.glb`, then **File → Export → VRM** (the add-on adds VRM bones
   and expressions; add `aa` + `blink` blend-shape clips when prompted).
4. Place the export at `public/avatar.vrm`.

⚠️ Ready Player Me avatars have their own license terms — fine for personal use,
check before commercial distribution. Route A avoids this entirely.

## Route C — Commission an artist

Search "VRM avatar commission" on Fiverr / X / VRoid Hub creators. Ask for:
**VRM 1.0, under 30k polygons, full commercial rights, source VRoid/Blender file
included.** Typical cost: $30–$150.

---

## Checklist before committing `avatar.vrm`

- [ ] Format **VRM 1.0** (0.x also loads, but 1.0 is cleaner)
- [ ] File size **< 10 MB** (workers' phones, slow networks)
- [ ] Has expressions **aa** and **blink** (VRoid exports these by default)
- [ ] You hold **commercial-use rights** to the model
- [ ] Quick local test: `npm run dev` → open the app → the 3D Shanti appears

## Verifying in the app

The loader checks `/avatar.vrm` on startup:

| State | What you see |
|---|---|
| File present & valid | 3D Shanti with lip-sync + blinking |
| File missing / broken | SVG avatar (automatic fallback) |
| Browser console | `VRM load failed: …` explains any parse error |
