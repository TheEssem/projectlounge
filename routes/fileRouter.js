import { readdirSync } from "node:fs";
import fastifyStatic from "@fastify/static";

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default async function(fastify, options) {
  const dir = readdirSync(options.dirName);
  const files = dir.filter((e) => e.match(/.*\.(png|gif|jpg|jpeg|webp)/ig));

  fastify.get("/", (req, res) => {
    res.redirect(`${options.prefix}/files/${encodeURIComponent(files[Math.floor(Math.random() * files.length)])}`, 302);
  });

  fastify.register(fastifyStatic, {
    root: options.dirName,
    list: {
      format: "html",
      render: (_, files) => {
        return `
<html><body>
<ul>
  ${files.map(file => `<li><a href="${options.prefix}${file.href}" target="_blank">${file.name}</a></li>`).join("\n  ")}
</ul>
</body></html>
`;
      }
    },
    index: false,
    redirect: true,
    prefix: "/files"
  });
}