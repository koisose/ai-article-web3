import { OpenAIStream, OpenAIStreamPayload } from "../../utils/scaffold-eth/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    const {api: key} = (await req.json()) as {
        api?: string;
     
    };

    if (key?.trim().length === 0) {
        return new Response("No key in the request", { status: 400 });
    }

    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Generate a random title on the topic of {random_topic} in the genre of {random_genre} response only with the title no explanation remove 'Title:' and (random_genre) from result` }],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 100,
        stream: true,
        n: 1,
    };

    const stream = await OpenAIStream(payload,key as string);
    return new Response(stream);
};

export default handler;