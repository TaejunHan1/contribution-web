import TemplatePage from '../template/[eventId]';

export default TemplatePage;

const INVITATION_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
const SLUG_LOOKUP_RETRY_DELAYS = [0, 120, 350];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchEventBySlug = async ({ supabaseUrl, supabaseKey, slug }) => {
  let lastError = null;

  for (const delay of SLUG_LOOKUP_RETRY_DELAYS) {
    if (delay > 0) await wait(delay);

    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/events?public_slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Supabase fetch failed: ${res.status}`);
      }

      const rows = await res.json();
      const event = Array.isArray(rows) ? rows[0] : null;

      if (event) {
        return { event, error: null };
      }
    } catch (error) {
      lastError = error;
      console.error('Short invitation URL fetch attempt failed:', {
        slug,
        message: error?.message,
      });
    }
  }

  return { event: null, error: lastError };
};

export async function getServerSideProps(context) {
  const slug = context.params?.slug || null;
  const { res } = context;

  if (res) {
    res.setHeader('Cache-Control', INVITATION_CACHE_CONTROL);
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  if (!slug) {
    return { notFound: true };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase env is not configured');
    }

    const { event, error } = await fetchEventBySlug({ supabaseUrl, supabaseKey, slug });

    if (!event) {
      if (error && res) {
        res.statusCode = 503;
        return {
          props: {
            serverEvent: null,
            serverOgEvent: null,
            serverTemplate: null,
            serverEventId: null,
            serverInvitationPath: `/w/${slug}`,
          },
        };
      }

      return { notFound: true };
    }

    const serverOgEvent = {
      id: event.id,
      event_type: event.event_type || null,
      main_person_name: event.main_person_name || null,
      groom_name: event.groom_name || null,
      bride_name: event.bride_name || null,
      event_date: event.event_date || null,
      ceremony_time: event.ceremony_time || null,
      death_date: event.death_date || null,
      burial_date: event.burial_date || null,
      burial_time: event.burial_time || null,
      funeral_home: event.funeral_home || null,
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
    if (res) {
      res.statusCode = 503;
    }

    return {
      props: {
        serverEvent: null,
        serverOgEvent: null,
        serverTemplate: null,
        serverEventId: null,
        serverInvitationPath: `/w/${slug}`,
      },
    };
  }
}
