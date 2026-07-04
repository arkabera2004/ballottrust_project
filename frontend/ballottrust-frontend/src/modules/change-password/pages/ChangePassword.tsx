import { motion } from 'framer-motion';

import PasswordForm from '../components/PasswordForm';

import { useChangePassword } from '../hooks/useChangePassword';

export default function ChangePassword() {

  const {

    loading,

    changePassword,

  } = useChangePassword();

  return (

    <motion.div

      initial={{
        opacity: 0,
      }}

      animate={{
        opacity: 1,
      }}

      className="max-w-2xl mx-auto"

    >

      <h1 className="text-3xl font-bold mb-8">

        Change Password

      </h1>

      <PasswordForm

        loading={loading}

        onSubmit={changePassword}

      />

    </motion.div>

  );

}