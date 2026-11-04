// The Markdown of each docs page, for the "Copy markdown" button.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export const getStaticPaths = (async () => {
	const entries = await getCollection('docs');
	return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<'docs'> }> = ({ props }) => {
	const { title } = props.entry.data;
	return new Response(`# ${title}\n\n${props.entry.body ?? ''}`.trimEnd() + '\n', {
		headers: { 'content-type': 'text/markdown; charset=utf-8' },
	});
};
