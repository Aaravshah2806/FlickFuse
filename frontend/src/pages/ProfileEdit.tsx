import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name is too long'),
  username: z.string().min(3, 'Username must be at least 3 characters')
    .max(20, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  bio: z.string().max(160, 'Bio is too long').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileEdit() {
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.display_name,
        username: data.username,
        bio: data.bio || null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#2563EB] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profile Photo</p>
              <p className="text-xs text-gray-400">Avatar upload coming soon</p>
            </div>
          </div>

          <Input
            label="Unique ID"
            value={profile?.unique_id || '---'}
            disabled
            helperText="This is your shareable ID for adding friends"
          />

          <Input
            label="Display Name"
            placeholder="How should we call you?"
            error={errors.display_name?.message}
            {...register('display_name')}
          />

          <Input
            label="Username"
            placeholder="your_username"
            error={errors.username?.message}
            helperText="This will be your public @handle"
            {...register('username')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB]"
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={160}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="mt-1.5 text-xs text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
