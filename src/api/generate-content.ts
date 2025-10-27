// API endpoint для генерации изображений с помощью ИИ
// Этот файл должен быть размещен в папке api/ или routes/ в зависимости от вашего фреймворка

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, size = "1024x1024", quality = "standard", style = "natural" } = await request.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Генерация изображения с помощью DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size as "1024x1024" | "1024x1792" | "1792x1024",
      quality: quality as "standard" | "hd",
      style: style as "vivid" | "natural",
      n: 1,
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    return Response.json({
      success: true,
      imageUrl,
      revisedPrompt,
      size,
      quality,
      style
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Альтернативная интеграция с Midjourney API
export async function generateWithMidjourney(prompt: string, options: any) {
  try {
    const response = await fetch('https://api.midjourney.com/v1/imagine', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MIDJOURNEY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        aspect_ratio: options.aspectRatio || "1:1",
        quality: options.quality || "high",
        style: options.style || "photographic"
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Midjourney API error:', error);
    throw error;
  }
}

// Интеграция с Stable Diffusion
export async function generateWithStableDiffusion(prompt: string, options: any) {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: 1,
        steps: 20,
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Stable Diffusion API error:', error);
    throw error;
  }
}

// Интеграция с RunwayML для генерации видео
export async function generateVideoWithRunwayML(prompt: string, options: any) {
  try {
    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: options.imageUrl,
        prompt: prompt,
        duration: options.duration || 4,
        seed: options.seed || Math.floor(Math.random() * 1000000)
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('RunwayML API error:', error);
    throw error;
  }
}
