// The Dygo version shown in the docs top bar. The docs sync sets it from the
// latest Git tag. When it is missing, the top bar hides the version.
export const version: string | undefined = import.meta.env.DYGO_VERSION || undefined;
