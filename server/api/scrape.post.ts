function getH1FromHtmlString(html: string) {
  const regex = /<h1.*?>(.*?)<\/h1>/;
  const match = html.match(regex);
  if (!match) {
    throw new Error("No H1 found in HTML");
  }
  return match[1];
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const url = body.url; // the article URL

  const html = await $fetch<string>(url);
  const title = getH1FromHtmlString(html);

  return {
    title,
  };
});
