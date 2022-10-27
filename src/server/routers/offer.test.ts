/**
 * Integration test example for the `offer` router
 */
import { createContextInner } from '../context';
import { AppRouter, appRouter } from './_app';
import { inferProcedureInput } from '@trpc/server';
import { test, expect } from '@playwright/test';

test('add and get offer', async () => {
  const ctx = await createContextInner({});
  const caller = appRouter.createCaller(ctx);

  const input: inferProcedureInput<AppRouter['offer']['add']> = {
    offerId: 'a21-001-test',
    responsiblePerson: 'test user',
  };

  const offer = await caller.offer.add(input);
  const byId = await caller.offer.byId({ id: offer.id });

  expect(byId).toMatchObject(input);
});
