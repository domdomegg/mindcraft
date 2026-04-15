# mindcraft

LLM agents that play Minecraft, built on [mineflayer](https://prismarinejs.github.io/mineflayer/#/).

> [!Note]
> This is an **unofficial fork** of [mindcraft-bots/mindcraft](https://github.com/mindcraft-bots/mindcraft) that packages it as an npm CLI with a browser-based setup. See [upstream issue #758](https://github.com/mindcraft-bots/mindcraft/issues/758) for context. All credit for the agent itself goes to the upstream authors.

> [!Caution]
> Don't connect to public servers with `allow_insecure_coding` enabled — it lets the LLM write and run code on your machine. It's off by default.

## Quick start

```bash
npx mindcraft ui
```

This opens a web UI where you set your Minecraft server address, add an API key, and create an agent. Settings are saved to `~/.config/mindcraft/` so subsequent runs pick up where you left off.

You'll need:
- [Minecraft Java Edition](https://www.minecraft.net/en-us/store/minecraft-java-bedrock-edition-pc) (up to v1.21.11; v1.21.6 recommended), with a world open to LAN
- [Node.js](https://nodejs.org/) 18 or 20 (v24+ may have native-dep issues)
- An API key for one of the [supported providers](#supported-providers) (or a local Ollama model)

For programmatic use:

```js
import { init, createAgent } from 'mindcraft';
await init();
await createAgent({ host: 'localhost', port: 25565, profile: { name: 'andy', model: 'gpt-4o-mini' } });
```

## Running from a checkout

If you want to hack on it, clone and `npm install`, start a Minecraft world open to LAN, then `node main.js`. Put API keys in `keys.json` (copy `keys.example.json`) and pick a profile in `settings.js`. The [FAQ](FAQ.md) covers common install errors.

To run benchmark tasks: `node main.js --task_path tasks/basic/single_agent.json --task_id gather_oak_logs` — see [MineCollab](minecollab.md).

## Configuration

The `npx mindcraft` UI writes config to `~/.config/mindcraft/config.json` and `keys.json`. Don't edit `settings.js` — it's defaults only. To override from the shell, use `SETTINGS_JSON='{"host":"..."}' node main.js` or `--profiles ./foo.json`.

Agent name, model and prompts live in a profile JSON (e.g. `andy.json`). The model can be a string like `"gpt-4o-mini"` or `"anthropic/claude-sonnet-4-6"`, or an object — see [Model Specifications](#model-specifications).

## Supported providers

<details>
<summary>All supported APIs</summary>

| API Name | Config Variable| Docs |
|------|------|------|
| `openai` | `OPENAI_API_KEY` | [docs](https://platform.openai.com/docs/models) |
| `google` | `GEMINI_API_KEY` | [docs](https://ai.google.dev/gemini-api/docs/models/gemini) |
| `anthropic` | `ANTHROPIC_API_KEY` | [docs](https://docs.anthropic.com/claude/docs/models-overview) |
| `xai` | `XAI_API_KEY` | [docs](https://docs.x.ai/docs) |
| `deepseek` | `DEEPSEEK_API_KEY` | [docs](https://api-docs.deepseek.com/) |
| `ollama` (local) | n/a | [docs](https://ollama.com/library) |
| `qwen` | `QWEN_API_KEY` | [Intl.](https://www.alibabacloud.com/help/en/model-studio/developer-reference/use-qwen-by-calling-api)/[cn](https://help.aliyun.com/zh/model-studio/getting-started/models) |
| `mistral` | `MISTRAL_API_KEY` | [docs](https://docs.mistral.ai/getting-started/models/models_overview/) |
| `replicate` | `REPLICATE_API_KEY` | [docs](https://replicate.com/collections/language-models) |
| `groq` (not grok) | `GROQCLOUD_API_KEY` | [docs](https://console.groq.com/docs/models) |
| `huggingface` | `HUGGINGFACE_API_KEY` | [docs](https://huggingface.co/models) |
| `novita` | `NOVITA_API_KEY` | [docs](https://novita.ai/model-api/product/llm-api?utm_source=github_mindcraft&utm_medium=github_readme&utm_campaign=link) |
| `openrouter` | `OPENROUTER_API_KEY` | [docs](https://openrouter.ai/models) |
| `glhf` | `GHLF_API_KEY` | [docs](https://glhf.chat/user-settings/api) |
| `hyperbolic` | `HYPERBOLIC_API_KEY` | [docs](https://docs.hyperbolic.xyz/docs/getting-started) |
| `vllm` | n/a | n/a |
| `cerebras` | `CEREBRAS_API_KEY` | [docs](https://inference-docs.cerebras.ai/introduction) |
| `mercury` | `MERCURY_API_KEY` | [docs](https://www.inceptionlabs.ai/) |

</details>

For more comprehensive model configuration and syntax, see [Model Specifications](#model-specifications).

For local models we support [ollama](https://ollama.com/) and we provide our own finetuned models for you to use. 
To install our models, install ollama and run the following terminal command:
```bash
ollama pull sweaterdog/andy-4:micro-q8_0 && ollama pull embeddinggemma
```

## Online servers

To connect to an online server the agent needs a real Microsoft/Minecraft account. Set `auth: "microsoft"` in the Server panel (or your config). The agent's profile name must exactly match the Minecraft account's username, or it will talk to itself. Mindcraft uses whichever account is active in the Minecraft launcher; switch accounts there, start the agent, then switch back.

## Docker

If you intend to `allow_insecure_coding`, it is a good idea to run the app in a docker container to reduce risks of running unknown code. This is strongly recommended before connecting to remote servers, although still does not guarantee complete safety.

```bash
docker build -t mindcraft . && docker run --rm --add-host=host.docker.internal:host-gateway -p 8080:8080 -p 3000-3003:3000-3003 -e SETTINGS_JSON='{"auto_open_ui":false,"profiles":["./profiles/gemini.json"],"host":"host.docker.internal"}' --volume ./keys.json:/app/keys.json --name mindcraft mindcraft
```
or simply
```bash
docker-compose up --build
```

When running in docker, use `host.docker.internal` instead of `localhost` to reach a Minecraft server on your host machine. For unsupported Minecraft versions, try [viaproxy](services/viaproxy/README.md).

# Profiles

A profile JSON (e.g. `andy.json`) defines the agent's name, which LLMs it uses for chat/coding/embedding, its prompts, and example conversations.

## Model Specifications

LLM models can be specified simply as `"model": "gpt-4o"`, or more specifically with `"{api}/{model}"`, like `"openrouter/google/gemini-2.5-pro"`. See all supported APIs [here](#model-customization).

The `model` field can be a string or an object. A model object must specify an `api`, and optionally a `model`, `url`, and additional `params`. You can also use different models/providers for chatting, coding, vision, embedding, and voice synthesis. See the example below.

```json
"model": {
  "api": "openai",
  "model": "gpt-4o",
  "url": "https://api.openai.com/v1/",
  "params": {
    "max_tokens": 1000,
    "temperature": 1
  }
},
"code_model": {
  "api": "openai",
  "model": "gpt-4",
  "url": "https://api.openai.com/v1/"
},
"vision_model": {
  "api": "openai",
  "model": "gpt-4o",
  "url": "https://api.openai.com/v1/"
},
"embedding": {
  "api": "openai",
  "url": "https://api.openai.com/v1/",
  "model": "text-embedding-ada-002"
},
"speak_model": "openai/tts-1/echo"
```

`model` is used for chat, `code_model` is used for newAction coding, `vision_model` is used for image interpretation, `embedding` is used to embed text for example selection, and `speak_model` is used for voice synthesis. `model` will be used by default for all other models if not specified. Not all APIs support embeddings, vision, or voice synthesis.

All apis have default models and urls, so those fields are optional. The `params` field is optional and can be used to specify additional parameters for the model. It accepts any key-value pairs supported by the api. Is not supported for embedding models.

## Embedding Models

Embedding models are used to embed and efficiently select relevant examples for conversation and coding.

Supported Embedding APIs: `openai`, `google`, `replicate`, `huggingface`, `novita`

If you try to use an unsupported model, then it will default to a simple word-overlap method. Expect reduced performance. We recommend using supported embedding APIs.

## Voice Synthesis Models

Voice synthesis models are used to narrate bot responses and specified with `speak_model`. This field is parsed differently than other models and only supports strings formatted as `"{api}/{model}/{voice}"`, like `"openai/tts-1/echo"`. We only support `openai` and `google` for voice synthesis.

# Contributing

Please contribute upstream at [mindcraft-bots/mindcraft](https://github.com/mindcraft-bots/mindcraft) — this fork tracks it. Join the upstream [discord](https://discord.gg/mp73p35dzC) for support.

## Patches

Some of the node modules that we depend on have bugs in them. To add a patch, change your local node module file and run `npx patch-package [package-name]`

## Development Team
Thanks to all who contributed to the project, especially the official development team: [@MaxRobinsonTheGreat](https://github.com/MaxRobinsonTheGreat), [@kolbytn](https://github.com/kolbytn), [@icwhite](https://github.com/icwhite), [@Sweaterdog](https://github.com/Sweaterdog), [@Ninot1Quyi](https://github.com/Ninot1Quyi), [@riqvip](https://github.com/riqvip), [@uukelele-scratch](https://github.com/uukelele-scratch), [@mrelmida](https://github.com/mrelmida)


## Citation:
This work is published in the paper [Collaborating Action by Action: A Multi-agent LLM Framework for Embodied Reasoning](https://arxiv.org/abs/2504.17950). Please use this citation if you use this project in your research:
```
@article{mindcraft2025,
  title = {Collaborating Action by Action: A Multi-agent LLM Framework for Embodied Reasoning},
  author = {White*, Isadora and Nottingham*, Kolby and Maniar, Ayush and Robinson, Max and Lillemark, Hansen and Maheshwari, Mehul and Qin, Lianhui and Ammanabrolu, Prithviraj},
  journal = {arXiv preprint arXiv:2504.17950},
  year = {2025},
  url = {https://arxiv.org/abs/2504.17950},
}
```

## Contributors

Thanks to everyone who has submitted issues on and off Github, made suggestions, and generally helped make this a better project.

![Contributors](https://contrib.rocks/image?repo=mindcraft-bots/mindcraft)
