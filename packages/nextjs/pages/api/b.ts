import { OpenAIStream, OpenAIStreamPayload } from "../../utils/scaffold-eth/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    const {api: key,title} = (await req.json()) as {
        api?: string;
     title?:string
    };

    if (key?.trim().length === 0) {
        return new Response("No key in the request", { status: 400 });
    }
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Example usage:
    const image = `https://source.unsplash.com/random?abstract,voxel,minecraft,lego,architecture&sig=${getRandomNumber(1, 100)}`
    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `create article with title:${title} using this template: # {{title}}\n![{{title}}](${image})\n## Introduction\nWrite an introductory paragraph here.\n\n## {{random_section_title_1}}\n{{random_section_content_1}}\n\n## {{random_section_title_2}}\n{{random_section_content_2}}\n\n## {{random_section_title_3}}\n{{random_section_content_3}}\n\n## Conclusion\n{{random_conclusion_paragraph}}` }],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1200,
        stream: true,
        n: 1,
    };

    const stream = await OpenAIStream(payload,key as string);
    return new Response(stream);
};

export default handler;