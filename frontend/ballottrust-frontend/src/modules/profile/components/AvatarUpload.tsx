import { useRef } from 'react';
import { Camera } from 'lucide-react';

type Props = {
  onSelect: (file: File) => void;
};

export default function AvatarUpload({
  onSelect,
}: Props) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  function openPicker() {

    inputRef.current?.click();

  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {

    const file =
      e.target.files?.[0];

    if (!file) return;

    onSelect(file);

  }

  return (
    <>

      <button
        type="button"
        onClick={openPicker}
        className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
      >

        <Camera size={18} />

      </button>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={handleChange}
      />

    </>
  );

}