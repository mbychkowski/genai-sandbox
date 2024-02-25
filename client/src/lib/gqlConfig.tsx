export default async function gqlQuery(query: string) {
  const res = await fetch('http://localhost:4000/gql', {
    method: 'POST',
    body: JSON.stringify({
      query,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.json();
}
