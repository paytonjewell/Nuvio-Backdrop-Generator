export async function uploadToImgbb(dataUrl) {
  const key = import.meta.env.VITE_IMGBB_KEY;
  if (!key) throw new Error("VITE_IMGBB_KEY is not set");

  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const form = new FormData();
  form.append("key", key);
  form.append("image", base64);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!json.success) throw new Error(`ImgBB upload failed (status ${json.status})`);
  return json.data.url;
}
