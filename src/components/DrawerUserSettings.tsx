'use client';

import {
  Drawer,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Divider,
  Group,
  Text,
  Progress,
  FileInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconCheck, IconKey, IconUserEdit, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { LoginUser } from '@/types/user';
import { UserRoundX } from 'lucide-react';

interface DrawerUserSettingsProps {
  opened: boolean;
  onClose: () => void;
}

export default function DrawerUserSettings({ opened, onClose }: DrawerUserSettingsProps) {
  const { user, setUser, logout } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState('');
  const [profilePictureBase64, setProfilePictureBase64] = useState<string | null>(null);

  const profileForm = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      profile_picture: '', // base64 o vacío
    },
    validate: {
      first_name: (value) => value.trim().length < 2 ? 'Nombre muy corto' : null,
      last_name: (value) => value.trim().length < 2 ? 'Apellidos muy cortos' : null,
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email no válido'),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
    validate: {
      current_password: (value) => value.length < 6 ? 'Contraseña actual requerida' : null,
      new_password: (value) => {
        if (value.length < 8) return 'Mínimo 8 caracteres';
        if (!/[A-Z]/.test(value)) return 'Debe incluir una mayúscula';
        if (!/[0-9]/.test(value)) return 'Debe incluir un número';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Debe incluir un símbolo';
        return null;
      },
      confirm_new_password: (value, values) =>
        value !== values.new_password ? 'Las contraseñas no coinciden' : null,
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.setValues({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
  }, [user]);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte', 'Excelente'];
    return { score, label: labels[score] };
  };

  const handleProfileSubmit = async (values: typeof profileForm.values) => {
    setLoadingProfile(true);
    try {
      const hasChanges =
        values.first_name !== user?.first_name ||
        values.last_name !== user?.last_name ||
        values.email !== user?.email ||
        (profilePictureBase64 && profilePictureBase64 !== user?.profile_picture);

      if (!hasChanges) {
        showNotification({
          title: 'Sin cambios',
          message: 'No se ha modificado ningún dato del perfil.',
          color: 'zenkooYellow',
          icon: <IconCheck size={16} />,
        });
        setLoadingProfile(false);
        return;
      }

      if (profilePictureBase64) {
        values.profile_picture = profilePictureBase64;
      }
      
      const payload: Record<string, any> = { ...values };

      if (!profilePictureBase64) {
        delete payload.profile_picture;
      }
      
      await api.patch('/api/users/profile/', payload);

      const updatedUser = { ...user, ...values };

      setUser(updatedUser as LoginUser);

      showNotification({
        title: 'Perfil actualizado',
        message: 'Los datos han sido guardados correctamente',
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: 'No se pudieron guardar los cambios',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    setLoadingPassword(true);
    try {
      await api.post('/api/users/change-password/', {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      showNotification({
        title: 'Contraseña cambiada',
        message: 'Tu contraseña ha sido cambiada. Por seguridad, volverás a iniciar sesión.',
        color: 'zenkoo',
        icon: <IconKey size={16} />,
      });
      passwordForm.reset();

      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.response?.data?.current_password?.[0] || 'No se pudo cambiar la contraseña',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    modals.openConfirmModal({
      title: 'Eliminar cuenta',
      centered: true,
      children: '¿Estás seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      labels: {
        confirm: 'Sí, elimínala',
        cancel: 'No, mejor no',
      },
      confirmProps: { color: 'zenkooRed' },
      onConfirm: async () => {
        try {
          await api.delete('/api/users/profile/');
          showNotification({
            title: 'Cuenta eliminada',
            message: 'Tu cuenta ha sido borrada correctamente.',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          onClose();
          logout(); // del contexto Auth
        } catch (error: any) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar la cuenta',
            color: 'zenkooRed',
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  return (
    <Drawer opened={opened} onClose={onClose} title="Configuración de usuario" padding="xl" size="sm" position="right">
      <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
        <Title order={4}>Datos personales</Title>
        <Stack>
          <TextInput label="Nombre" placeholder="Tu nombre" {...profileForm.getInputProps('first_name')} required />
          <TextInput label="Apellidos" placeholder="Tus apellidos" {...profileForm.getInputProps('last_name')} required />
          <TextInput label="Correo electrónico" placeholder="tu@email.com" {...profileForm.getInputProps('email')} required />
          <FileInput
            label="Foto de perfil"
            placeholder="Sube una imagen"
            accept="image/*"
            value={null}
            onChange={(file) => {
              if (!file) return;

              // Validación de tipo de archivo
              const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
              if (!validTypes.includes(file.type)) {
                showNotification({
                  title: 'Tipo no permitido',
                  message: 'Solo se permiten imágenes JPG, PNG o WebP',
                  color: 'zenkooRed',
                  icon: <IconX size={16} />,
                });
                return;
              }

              // Validación de tamaño (2MB máximo)
              const maxSizeInMB = 2;
              if (file.size > maxSizeInMB * 1024 * 1024) {
                showNotification({
                  title: 'Imagen muy grande',
                  message: `El tamaño máximo permitido es ${maxSizeInMB}MB`,
                  color: 'zenkooRed',
                  icon: <IconX size={16} />,
                });
                return;
              }

              // Convertir a base64 si todo OK
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64String = reader.result?.toString();
                if (base64String) {
                  setProfilePictureBase64(base64String);
                  profileForm.setFieldValue('profile_picture', base64String);
                }
              };
              reader.readAsDataURL(file);
            }}
            description="Aparecerá en tu avatar y menú de usuario (máx. 2MB)"
            withAsterisk={false}
          />
          <Group mt="sm" justify="right">
            <Button type="submit" loading={loadingProfile} leftSection={<IconUserEdit size={16} />}>
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </form>

      <Divider my="xl" />

      <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
        <Title order={4}>Cambiar contraseña</Title>
        <Stack>
          <PasswordInput label="Contraseña actual" {...passwordForm.getInputProps('current_password')} required />
          <PasswordInput
            label="Nueva contraseña"
            {...passwordForm.getInputProps('new_password')}
            onChange={(event) => {
              passwordForm.setFieldValue('new_password', event.currentTarget.value);
              const { score, label } = getPasswordStrength(event.currentTarget.value);
              setPasswordStrength(score);
              setPasswordLabel(label);
            }}
            required
          />
          <Progress
            value={(passwordStrength / 5) * 100}
            color={passwordStrength < 2 ? 'zenkooRed' : passwordStrength < 4 ? 'zenkooYellow' : 'zenkoo'}
          />
          <Text size="xs" c="dimmed" mt={4}>
            Fortaleza: {passwordLabel}
          </Text>
          <PasswordInput
            label="Confirmar nueva contraseña"
            {...passwordForm.getInputProps('confirm_new_password')}
            required
          />
          <Group mt="sm" justify="right">
            <Button type="submit" loading={loadingPassword} leftSection={<IconKey size={16} />}>
              Cambiar contraseña
            </Button>
          </Group>
        </Stack>
      </form>

      <Divider my="xl" />

      <Stack>
        <Title order={4} c="zenkooRed">Eliminar cuenta</Title>
        <Text size="sm" c="dimmed">
          Esta acción no se puede deshacer. Se eliminarán todos tus datos.
        </Text>
        <Button
          color="zenkooRed"
          variant="outline"
          onClick={handleDeleteAccount}
          leftSection={<UserRoundX size={16} />}
        >
          Eliminar cuenta permanentemente
        </Button>
      </Stack>
    </Drawer>
  );
}
