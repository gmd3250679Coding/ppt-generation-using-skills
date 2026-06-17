# Directory Structure

```text
ppt_generation_using_skills/
  architecture/
    README.md
    system-overview.md
    layered-architecture.md
    generation-sequence.md
    directory-structure.md

  frontend/
    src/
      components/
      pages/
      hooks/
      services/
      styles/
      types/

  backend/
    src/
      routes/
      controllers/
      services/
      skill-loader/
      generators/
      providers/
      renderers/
      storage/
      types/

  skills/
    Uploaded or locally installed skill packages.

  outputs/
    Generated PPTX, HTML preview, PDF, images, and job metadata.

  temp/
    Temporary files used during upload, parsing, and rendering.
```

## Folder Intent

- `frontend/`: React app used by colleagues to configure and run PPT generation.
- `backend/`: local API service and generation orchestration.
- `skills/`: user-uploaded or pre-installed skill packages.
- `outputs/`: generated deck artifacts and preview files.
- `temp/`: short-lived working files.
- `architecture/`: product and technical architecture notes.

