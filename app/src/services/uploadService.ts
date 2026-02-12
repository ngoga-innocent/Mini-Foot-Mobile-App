export const uploadImageToCloudinary = async (uri: string) => {
  try {
    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: `player_${Date.now()}.jpg`,
    } as any);

    // Your unsigned upload preset name
    data.append("upload_preset", "minifoot_players");

    const cloudName = "dz7v9gwzd"; // Replace with your Cloudinary cloud name

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await response.json();
    return json.secure_url; // This is your image URL
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};
