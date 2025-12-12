import supabase from "../config/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const uploadRepository = {
  async uploadFile(file) {
    try {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload ke Supabase bucket
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      // Ambil public URL
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(filePath);

      return {
        path: filePath,             // path di bucket
        url: publicUrlData.publicUrl // URL file
      };
    } catch (err) {
      throw new Error(`Gagal upload file ke Supabase: ${err.message}`);
    }
  }
};

export default uploadRepository;
