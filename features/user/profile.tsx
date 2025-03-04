import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { createClient } from '../../utils/supabase/server';
import { InfoItem } from './InfoItem';

export const Profile = async () => {
  // TODO: add a cache to the user query?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (!profile) {
    redirect('/error');
  }

  const isAdmin = profile.role === 'admin';

  return (
    <div className="flex flex-col gap-2">
      {/* only these need  */}
      <InfoItem label="Name" value={`${profile.first_name} ${profile.last_name}`} />
      <InfoItem label="Email" value={profile.email} />
      <InfoItem label="User ID" value={profile.user_id} />
      {isAdmin && <InfoItem label="Role" value={profile.role} />}

      {isAdmin && (
        <div className="flex items-start pt-3">
          <Link href="/dashboard">
            <Button className="rounded-3xl">Admin Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
