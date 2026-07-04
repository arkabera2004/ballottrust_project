type Props = {

  src?: string;

  name?: string;

  size?: number;

};

export default function Avatar({

  src,

  name,

  size = 120,

}: Props) {

  if (src) {

    return (

      <img

        src={src}

        alt={name}

        style={{
          width: size,
          height: size,
        }}

        className="rounded-full object-cover border-4 border-white shadow-lg"

      />

    );

  }

  return (

    <div

      style={{
        width: size,
        height: size,
      }}

      className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg"

    >

      <span
        style={{
          fontSize: size / 2.8,
        }}
      >

        {name?.charAt(0).toUpperCase()}

      </span>

    </div>

  );

}