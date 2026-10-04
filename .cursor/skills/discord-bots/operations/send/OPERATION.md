# Send messages

Message resource: <https://docs.discord.com/developers/resources/message>.

## Limits that fail the request

| What | Limit |
|---|---|
| `content` | 2000 characters. A bot does not get a Nitro user's 4000. |
| Embeds per message | 10 |
| All embed text combined | 6000 characters |
| Embed title | 256 |
| Embed description | 4096 |
| Embed field name / value | 256 / 1024 |
| Embed footer | 2048 |
| Whole create-message request | 25 MiB |

Whitespace at the ends of embed fields is trimmed and not counted. Going over
any of these is HTTP 400, not a truncated send.

`allowed_mentions` defaults can ping `@everyone`, roles, or users if the text
contains mentions. If the text is untrusted (a model wrote it, a user pasted
it), set `allowed_mentions` to none unless a ping is the point.

```python
await channel.send(text, allowed_mentions=discord.AllowedMentions.none())
```

## Chunk long text

Split only on the way out. Keep one string in the program.

1. If the text is over 2000 characters, cut on the last newline before 2000.
2. If a single line is over 2000, cut that line at 2000.
3. Do not cut in the middle of a fenced code block if another cut is within
   the limit. If the fence itself is longer than 2000, close and reopen the
   fence on each chunk.
4. Send chunks in order. Wait for each `send` to return so order holds.

If the text is a diff, a log, or anything a person will not read inside a
chat bubble, attach a file instead of a dozen messages. The 25 MiB cap is on
the request.

```python
import io

file = discord.File(io.BytesIO(text.encode()), filename="result.md")
await channel.send(file=file, allowed_mentions=discord.AllowedMentions.none())
```

## Threads

`Send Messages` does not apply inside a thread. The bot needs
**Send Messages in Threads**. A missing permission is 403, not an empty send.

Posting into a forum or media channel's parent fails. Those channels only
hold threads. Create the thread (the post), then send inside it. See
[Channels, threads, forums](../channels/OPERATION.md).
