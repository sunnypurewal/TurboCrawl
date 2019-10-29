/**
 * @module TurboCrawl
 */

/**
 * The default port is 8088
 */
export const PORT: number = parseInt(process.env.port || "8088", 10)

/**
 * The default host is "localhost".
 * Setting it to "0.0.0.0" will make the server visible to your network.
 */
export const HOST: string = process.env.host || "localhost"
