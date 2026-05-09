'use server';

import { createClient } from '../../../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function togglePropertyActive(
  id: string,
  currentIsActive: boolean,
  locale: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({ is_active: !currentIsActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/${locale}/admin/properties`);
}
