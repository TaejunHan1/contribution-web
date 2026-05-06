import TemplatePage from '../template/[eventId]';

export default TemplatePage;

export async function getServerSideProps(context) {
  const slug = context.params?.slug || null;

  if (!slug) {
    return { notFound: true };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { notFound: true };
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/events?public_slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status}`);
    }

    const rows = await res.json();
    const event = Array.isArray(rows) ? rows[0] : null;

    if (!event) {
      return { notFound: true };
    }

    const serverOgEvent = {
      id: event.id,
      groom_name: event.groom_name || null,
      bride_name: event.bride_name || null,
      event_date: event.event_date || null,
      ceremony_time: event.ceremony_time || null,
      location: event.location || null,
      template_style: event.template_style || null,
    };

    return {
      props: {
        serverEvent: null,
        serverOgEvent,
        serverTemplate: event.template_style || null,
        serverEventId: event.id,
        serverInvitationPath: `/w/${slug}`,
      },
    };
  } catch (error) {
    console.error('Short invitation URL fetch error:', error);
    return { notFound: true };
  }
}
