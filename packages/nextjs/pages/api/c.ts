import { OpenAIStream, OpenAIStreamPayload } from "../../utils/scaffold-eth/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    const {api: key,comment} = (await req.json()) as {
        api?: string;
        comment?: string;
    };
   
    if (key?.trim().length === 0) {
        return new Response("No key in the request", { status: 400 });
    }

    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Generate a random comment ${comment?.trim().length===0?"":`about this article \`\`\`${comment}\`\`\``}` }],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 300,
        stream: true,
        n: 1,
    };

    const stream = await OpenAIStream(payload,key as string);
    return new Response(stream);
};

export default handler;