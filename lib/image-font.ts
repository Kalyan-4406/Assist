export async function imageFonts(request: Request) {
  try {
    const response = await fetch(
      new URL("/fonts/SpaceGrotesk-Bold.ttf", request.url),
      { signal: AbortSignal.timeout(2500) },
    );
    if (!response.ok) throw new Error("Font unavailable");
    return [
      {
        name: "Space Grotesk",
        data: await response.arrayBuffer(),
        weight: 700 as const,
        style: "normal" as const,
      },
    ];
  } catch {
    return undefined;
  }
}
