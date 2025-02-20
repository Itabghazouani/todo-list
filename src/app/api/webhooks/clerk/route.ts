import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
  // Get the webhook secret from your environment variables
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers and await them since headers() returns a Promise
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create a new user in your database
    try {
      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id, // Using Clerk's user ID as our user ID
          clerkId: evt.data.id,
        },
      });
      console.log('Created new user:', newUser);
      return new Response('User created', { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
};
