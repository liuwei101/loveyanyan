export const config = { runtime: "edge" };

// 初始化KV数据库
const kv = await globalThis.__VERCEL_KV__;

// 获取全部数据
export default async function handler(req) {
    const { method } = req;
    const key = "recruit_list";

    if (method === "GET") {
        // 查询数据
        let list = await kv.get(key);
        list = list ? JSON.parse(list) : [];
        return new Response(JSON.stringify(list), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (method === "POST") {
        const body = await req.json();
        let list = await kv.get(key);
        list = list ? JSON.parse(list) : [];

        // 保存/编辑
        if (body.data) {
            const { id } = body;
            if (id) {
                // 编辑
                const idx = list.findIndex(item => item.id === Number(id));
                if (idx > -1) list[idx] = body.data;
            } else {
                // 新增
                list.unshift(body.data);
            }
            await kv.set(key, JSON.stringify(list));
            return new Response("ok");
        }

        // 删除
        if (body.id) {
            list = list.filter(item => item.id !== Number(body.id));
            await kv.set(key, JSON.stringify(list));
            return new Response("ok");
        }
    }
    return new Response("error");
}
