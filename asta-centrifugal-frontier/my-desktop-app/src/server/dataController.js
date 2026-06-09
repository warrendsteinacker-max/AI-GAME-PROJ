export async function processIncomingPayload(data) {
  if (!data || Object.keys(data).length === 0) throw new Error('Empty payload.');
  return { recordId: 'REC-' + Date.now(), status: 'PROCESSED' };
}