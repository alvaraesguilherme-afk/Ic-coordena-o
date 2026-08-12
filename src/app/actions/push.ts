"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function saveSubscription(subscription: SubscriptionInput) {
  const session = await verifySession();

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: session.userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId: session.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function removeSubscription(endpoint: string) {
  await verifySession();
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
