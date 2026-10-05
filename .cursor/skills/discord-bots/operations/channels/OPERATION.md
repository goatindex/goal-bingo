# Channels, threads, forums

Channel object: <https://docs.discord.com/developers/resources/channel>.
Threads and forums: <https://docs.discord.com/developers/topics/threads>.
Caps: <https://support.discord.com/hc/en-us/articles/33694251638295-Discord-Account-Caps-Server-Caps-and-More>.

## Caps

These count against a server of any boost level:

| Cap | Number | What counts |
|---|---|---|
| Channels | 500 | Text, voice, forum, media, stage, and **categories** |
| Categories | 50 | A category is a channel of type `GUILD_CATEGORY` (4) |
| Channels in one category | 50 | |

Creating past a cap fails. It does not silently spill into another category.

**Threads do not count toward the 500.** Active threads are capped; the
threads page does not publish a single integer for that cap. As a server
nears it, Discord shortens archive timers. Archived threads are not part of
the active set. Only active threads can be edited, reacted to, or used for
commands. Sending a message unarchives a thread unless it is locked.

`auto_archive_duration` is 60, 1440, 4320, or 10080 minutes. Activity is a
message, an unarchive, or a change to that duration. A busy channel can
archive a 7-day thread sooner.

## Types you will actually create

| Type | Integer | What it is |
|---|---|---|
| `GUILD_TEXT` | 0 | Ordinary text channel. Holds messages and threads. |
| `GUILD_CATEGORY` | 4 | A heading. Holds other channels. Holds no messages. |
| `GUILD_FORUM` | 15 | Posts only. You cannot send a message in the forum channel itself. |
| `PUBLIC_THREAD` | 11 | A thread in a text channel, or a post in a forum. |
| `PRIVATE_THREAD` | 12 | Invite-only. Text channels only. |
| `GUILD_MEDIA` | 16 | Like a forum, still marked beta on the threads page. |

A public thread in a text channel is created from a message (they share an
id) or as a standalone thread. A forum post is created with
`POST /channels/{forum.id}/threads` and includes the first message in that
call. Creating a forum post needs **Send Messages** on the forum, not
**Create Public Threads**.

Thread speech needs **Send Messages in Threads**. `Send Messages` on the
parent does not carry into the thread.

Permissions inherit from the parent. A public thread is readable by anyone
who can view the parent. A private thread is visible to its members and to
anyone with **Manage Threads**.

## Membership and notifications

Seeing a thread and being a member are different. Push notifications follow
membership. The member object carries the notification flags.
<https://docs.discord.com/developers/topics/threads>

The user who creates the thread is a member. Everyone else is not, until one
of these happens:

- They join it, or send a message in it.
- The bot adds them. On a public thread that needs **Send Messages in
  Threads**. On a private thread with `invitable` off, it needs **Manage
  Threads**.

```python
await thread.add_user(user)
```

`add_user` posts a system message in the thread (`@bot added @user`).
@mentioning someone in a message inside the thread also adds them, and
notifies them according to their own notification settings. Use the mention
when the system line is noise. Use `add_user` when you need the member
record and can tolerate the system line.

If the bot opens the thread, the bot is the member who gets created with it.
People who can see the parent channel do not automatically follow that
thread. Add or @mention each person who must be notified.

## Creating channels

Need **Manage Channels**. The bot does not have it unless the invite granted
it.

```python
category = await guild.create_category("team")
channel = await guild.create_text_channel("general", category=category)
thread = await channel.create_thread(name="topic", type=discord.ChannelType.public_thread)
await thread.send("started")
```

Prefer binding to channels a person created, as live-action-intel does
(`docs/channels.md`: the service creates no channels), unless the feature's
job is to create them. A bot that creates a channel per task will hit 50 per
category and then 500 per server.

Forum and media channels: create the thread, then talk inside it. A send to
the parent channel fails.
