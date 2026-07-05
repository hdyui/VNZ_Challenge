// src/features/news/components/CoverImageUploader.tsx
import { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImagePlus, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { newsApi } from "../services";
import { getCroppedImageFile, readImageDimensions } from "../utils/cropImage";

interface AspectOption {
  key: string;
  label: string;
  ratio: number | undefined; // undefined = tự do
  recommend: string;
  minWidth: number;
  minHeight: number;
}

// ─── Các tỉ lệ ảnh bìa được hỗ trợ ─────────────────────────────────────────
const ASPECT_OPTIONS: AspectOption[] = [
  {
    key: "16:9",
    label: "16:9 (Banner ngang)",
    ratio: 16 / 9,
    recommend: "≥ 1280 × 720px",
    minWidth: 1280,
    minHeight: 720,
  },
  {
    key: "1:1",
    label: "1:1 (Vuông)",
    ratio: 1,
    recommend: "≥ 800 × 800px",
    minWidth: 800,
    minHeight: 800,
  },
  {
    key: "4:3",
    label: "4:3",
    ratio: 4 / 3,
    recommend: "≥ 1024 × 768px",
    minWidth: 1024,
    minHeight: 768,
  },
  {
    key: "3:2",
    label: "3:2",
    ratio: 3 / 2,
    recommend: "≥ 1200 × 800px",
    minWidth: 1200,
    minHeight: 800,
  },
  {
    key: "free",
    label: "Tự do",
    ratio: undefined,
    recommend: "Không giới hạn",
    minWidth: 0,
    minHeight: 0,
  },
];

const MAX_FILE_SIZE_MB = 5;

interface CoverImageUploaderProps {
  value?: string; // URL ảnh bìa hiện tại (đã upload xong qua /auth/uploads)
  onChange: (url: string) => void;
  disabled?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined,
): Crop {
  if (!aspect) {
    return { unit: "%", width: 90, height: 90, x: 5, y: 5 };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export const CoverImageUploader = ({
  value,
  onChange,
  disabled,
}: CoverImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [aspectKey, setAspectKey] = useState<string>("16:9");
  const [modalOpen, setModalOpen] = useState(false);
  const [srcDataUrl, setSrcDataUrl] = useState<string | null>(null);
  const [srcFileName, setSrcFileName] = useState("cover.jpg");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [warning, setWarning] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAspect =
    ASPECT_OPTIONS.find((a) => a.key === aspectKey) ?? ASPECT_OPTIONS[0];

  const resetPickerState = () => {
    setSrcDataUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setWarning(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file ảnh hợp lệ.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Ảnh không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      const { width, height, dataUrl } = await readImageDimensions(file);
      setSrcFileName(file.name.replace(/\.[^.]+$/, "") + ".jpg");
      setSrcDataUrl(dataUrl);
      setModalOpen(true);

      if (
        currentAspect.minWidth &&
        (width < currentAspect.minWidth || height < currentAspect.minHeight)
      ) {
        setWarning(
          `Ảnh gốc (${width}×${height}px) nhỏ hơn kích thước khuyến nghị cho tỉ lệ ${currentAspect.label} (${currentAspect.recommend}). Ảnh có thể bị mờ khi hiển thị.`,
        );
      } else {
        setWarning(null);
      }
    } catch {
      setError("Không thể đọc file ảnh, vui lòng thử lại.");
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, currentAspect.ratio));
  };

  const handleChangeAspectInModal = (key: string) => {
    setAspectKey(key);
    const option =
      ASPECT_OPTIONS.find((a) => a.key === key) ?? ASPECT_OPTIONS[0];
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, option.ratio));
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    resetPickerState();
  };

  const handleConfirmCrop = async () => {
    if (!imgRef.current) return;
    setIsUploading(true);
    setError(null);
    try {
      // Nếu người dùng chưa kéo vùng chọn nào, dùng toàn bộ ảnh làm mặc định
      const cropToUse: PixelCrop =
        completedCrop && completedCrop.width > 0 && completedCrop.height > 0
          ? completedCrop
          : {
              unit: "px",
              x: 0,
              y: 0,
              width: imgRef.current.width,
              height: imgRef.current.height,
            };

      const croppedFile = await getCroppedImageFile(
        imgRef.current,
        cropToUse,
        srcFileName,
      );

      // Upload ngay qua POST /auth/uploads, lấy về URL, dùng URL này làm
      // giá trị coverImg (gửi kèm dạng text field khi tạo/sửa bài viết).
      const res = await newsApi.uploadImage(croppedFile);
      const uploadedUrl =
        (res.data as any)?.url ?? (res.data as any)?.urlImage ?? "";

      if (!uploadedUrl) {
        throw new Error("Server không trả về URL ảnh.");
      }

      onChange(uploadedUrl);
      closeModal();
    } catch (err: any) {
      setError(err?.message || "Upload ảnh bìa thất bại, vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Ảnh bìa</label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 size={12} /> Xóa ảnh
          </button>
        )}
      </div>

      {/* Chọn tỉ lệ ảnh mong muốn */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">Tỉ lệ:</span>
        <Select value={aspectKey} onValueChange={setAspectKey}>
          <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-gray-400">
        Khuyến nghị: {currentAspect.recommend}. Nếu ảnh gốc lớn hơn khung đã
        chọn, bạn có thể kéo để cắt vừa khung trước khi tải lên.
      </p>

      {/* Preview / dropzone */}
      {value ? (
        <div
          className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
          style={{
            aspectRatio: currentAspect.ratio
              ? String(currentAspect.ratio)
              : "16/9",
          }}
        >
          <img
            src={value}
            alt="Ảnh bìa"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/40 via-transparent to-transparent p-3 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 bg-white/90"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đổi ảnh
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-gray-400 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            aspectRatio: currentAspect.ratio
              ? String(currentAspect.ratio)
              : "16/9",
          }}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-medium">Chọn ảnh bìa</span>
          <span className="text-xs">JPG, PNG tối đa {MAX_FILE_SIZE_MB}MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickFile}
      />

      {error && !modalOpen && <p className="text-xs text-red-500">{error}</p>}

      {/* Modal cắt ảnh */}
      {modalOpen && srcDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-800">
                Cắt ảnh bìa
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">Tỉ lệ:</span>
                <Select
                  value={aspectKey}
                  onValueChange={handleChangeAspectInModal}
                >
                  <SelectTrigger className="h-9 w-[220px] rounded-lg border-gray-200 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {warning && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {warning}
                </p>
              )}

              <div className="flex justify-center rounded-xl bg-gray-900/5 p-2">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={currentAspect.ratio}
                  minWidth={40}
                  minHeight={40}
                  keepSelection
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img
                    src={srcDataUrl}
                    onLoad={handleImageLoad}
                    style={{ maxHeight: "55vh" }}
                  />
                </ReactCrop>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCrop}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lên...
                  </>
                ) : (
                  "Xác nhận & tải lên"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
