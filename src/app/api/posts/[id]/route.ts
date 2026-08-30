import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const session = await auth();

        if(!session?.user.id) {
            return Response.json(
                { message: "ログインが必要です" },
                { status: 401 }
            );
        }
        
        const  { id } = await params;

        const post = await prisma.post.findUnique({
            where: {
                id: Number(id),
            },
        });

        if(!post) {
            return Response.json(
                { message: "投稿が見つかりません" },
                { status: 404}
            );
        }

        if(post.authorId !== Number(session.user.id)) {
            return Response.json(
                { message: "この投稿を削除する権限がありません" },
                { status: 403}
            );
        }

        await prisma.post.delete({
            where: {
                id: Number(id),
            },
        });
    
        return Response.json(
            { message: "削除しました" },
            { status: 200 }
        );    
    } catch (error) {
        console.error(error);

        return Response.json(
            { message: "削除に失敗しました" },
            { status: 500 }
        );
    }
}