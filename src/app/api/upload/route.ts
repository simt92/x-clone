import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,
    api_key:
        process.env.CLOUDINARY_API_KEY,
    api_secret:
        process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
    request: Request
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            {
                error: "ログインが必要です"
            },
            {
                status: 401
            }
        );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
        return Response.json(
            {
                error: "画像を選択してください"
            },
            {
                status: 400
            }
        );
    }

    if (!file.type.startsWith("image/")) {
        return Response.json(
            {
                error: "画像ファイルのみアップロードできます"
            },
            {
                status: 400
            }
        );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        return Response.json(
            {
                error: "画像は5MB以下にしてください",
            },
            {
                status: 400
            }
        );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
        secure_url: string;
    }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "x-clone/profile-images",
            },
            (error, result) => {
                if (error || !result) {
                    reject(
                        error ?? new Error("アップロードに失敗しました")
                    );

                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                });
            }
        );

        uploadStream.end(buffer);
    });

    return Response.json({
        url: result.secure_url,
    });
}