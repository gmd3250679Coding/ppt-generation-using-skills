import { FileArchive, UploadCloud, X } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import type { SkillUpload } from "../types/generation";

interface SkillUploaderProps {
  value: SkillUpload;
  onChange: (value: SkillUpload) => void;
}

export function SkillUploader({ value, onChange }: SkillUploaderProps) {
  const setFile = (file: File | null) => {
    onChange({
      file,
      packageName: file?.name.replace(/\.(zip|md)$/i, "") ?? value.packageName
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 01</span>
          <h2>上传 PPT Skill</h2>
        </div>
        <FileArchive aria-hidden="true" />
      </div>

      <label
        className="drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud aria-hidden="true" />
        <span>{value.file ? value.file.name : "拖放或选择 Skill 压缩包"}</span>
        <small>支持 .zip、SKILL.md 或包含模板和 assets 的本地包</small>
        <input
          type="file"
          accept=".zip,.md,.markdown"
          onChange={handleFileChange}
          aria-label="选择 PPT Skill 文件"
        />
      </label>

      <label className="field">
        <span>Skill 名称</span>
        <input
          value={value.packageName}
          onChange={(event) => onChange({ ...value, packageName: event.target.value })}
          placeholder="例如：inspur-ppt-skill"
        />
      </label>

      {value.file ? (
        <button className="ghost-button" type="button" onClick={() => setFile(null)}>
          <X aria-hidden="true" />
          清除文件
        </button>
      ) : null}
    </section>
  );
}
