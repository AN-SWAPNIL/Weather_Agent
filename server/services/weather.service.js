import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { config } from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

config();
const llmModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

//   https://api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={API key}

/*
API calls

api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={API key}

Parameters
q	required	City name, state code and country code divided by comma, use ISO 3166 country codes. You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in our predefined list of more than 200,000 locations.
appid	required	Your unique API key (you can always find it on your account page under the "API key" tab)
cnt	optional	A number of days, which will be returned in the API response (from 1 to 16). Learn more
units	optional	Units of measurement. standard, metric and imperial units are available. If you do not use the units parameter, standard units will be applied by default. Learn more
lang	optional	You can use this parameter to get the output in your language. Learn more


API call

https://history.openweathermap.org/data/2.5/history/city?q={city name},{country code}&type=hour&start={start}&end={end}&appid={API key}

https://history.openweathermap.org/data/2.5/history/city?q={city name},{country code}&type=hour&start={start}&cnt={cnt}&appid={API key}

Parameters
q	required	
City name, state code and country code divided by comma, please refer to ISO 3166 for the state codes or country codes.

You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in our predefined list of more than 200,000 locations.

type	required	type of the call, keep this parameter in the API call as hour
appid	required	Your unique API key (you can always find it on your account page under the "API key" tab)
start	optional	Start date (unix time, UTC time zone), e.g. start=1369728000
end	optional	End date (unix time, UTC time zone), e.g. end=1369789200
cnt	optional	A number of timestamps in response (one per hour, can be used instead of end)


API call

https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

Parameters
q	required	City name, state code and country code divided by comma, Please refer to ISO 3166 for the state codes or country codes.
You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in our predefined list of more than 200,000 locations.

appid	required	Your unique API key (you can always find it on your account page under the "API key" tab)
units	optional	Units of measurement. standard, metric and imperial units are available. If you do not use the units parameter, standard units will be applied by default. Learn more
lang	optional	You can use this parameter to get the output in your language. Learn more
*/

const currentWeather = tool(
  async ({ city }) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) {
      console.log("Failed to fetch current weather data");
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    return data;
  },
  {
    name: "currentWeather",
    description: "A tool to get the current weather for a city.",
    schema: z.object({
      city: z
        .string()
        .describe(
          "City name, state code and country code divided by comma, e.g. 'London,GB'. You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in the predefined list of more than 200,000 locations."
        ),
    }),
  }
);

const forecastWeather = tool(
  async ({ city }) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) {
      console.log("Failed to fetch forecast weather data");
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    return data;
  },
  {
    name: "forecastWeather",
    description:
      "A tool to get the forecast weather for a city for the next 16 days.",
    schema: z.object({
      city: z
        .string()
        .describe(
          "City name, state code and country code divided by comma, e.g. 'London,GB'. You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in the predefined list of more than 200,000 locations."
        ),
    }),
  }
);

const historyWeather = tool(
  async ({ city, start, end }) => {
    // Convert start and end from ISO string to Unix time (seconds)

    console.log("start", start);
    console.log("end", end);
    // If start and end are not provided, use undefined
    let startUnix = undefined;
    let endUnix = undefined;
    if (start) {
      startUnix = Math.floor(new Date(start).getTime() / 1000);
    }
    if (end) {
      endUnix = Math.floor(new Date(end).getTime() / 1000);
    }
    const url =
      `https://history.openweathermap.org/data/2.5/history/city?q=${city}` +
      (startUnix ? `&start=${startUnix}` : "") +
      (endUnix ? `&end=${endUnix}` : "") +
      `&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      console.log("Failed to fetch history weather data", response);
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    return data;
  },
  {
    name: "historyWeather",
    description:
      "A tool to get the historical weather for a city for a given time period. The start and end dates should be provided as ISO 8601 strings (e.g. '2025-05-08T00:00:00Z'). They will be converted to Unix time (UTC) automatically.",
    schema: z.object({
      city: z
        .string()
        .describe(
          "City name, state code and country code divided by comma, e.g. 'London,GB'. You can specify the parameter not only in English. In this case, the API response should be returned in the same language as the language of requested location name if the location is in the predefined list of more than 200,000 locations."
        ),
      start: z
        .string()
        .optional()
        .describe(
          "Start date as an ISO 8601 string (e.g. '2025-05-08T00:00:00Z'). Always require timezone information. Optional. If not provided, defaults to 7 days before the current date."
        ),
      end: z
        .string()
        .optional()
        .describe(
          "End date as an ISO 8601 string (e.g. '2025-05-08T23:59:59Z'). Always require timezone information. Optional. If not provided, defaults to the current date."
        ),
    }),
  }
);

const tools = [currentWeather, forecastWeather, historyWeather];

const llmWithTools = llmModel.bindTools(tools);

const llmCall = async (state) => {
  // MessagesAnnotation.State
  const result = await llmWithTools.invoke([
    {
      role: "system",
      content: `
        You are Weather AI, a friendly assistant for weather-related questions using tools.

        **Guidelines:**
        - Be clear, concise, and human-friendly.
        - Not calculative, but rather conversational. In natural language.
        - Without giving exact information, but rather human tone, so that the user can understand.
        - Adapt your tone to match the user's mood.
        - Use the most relevant tool available to answer the user's question.
        - If input is unclear or invalid, ask for clarification in a helpful manner.
        - If a city or location cannot be found or an error occurs, offer a supportive reply.
        - For irrelevant or off-topic questions, gently redirect the user to weather-related topics.

        **Examples:**

        1. **User:** _I’m planning a picnic this weekend—should I pick Saturday or Sunday?_  
          **Assistant:** _Saturday has a 20% chance of showers, but Sunday is clear. I recommend Sunday for your picnic._

        2. **User:** _My flight lands at 7 AM tomorrow in Dhaka. Will it be foggy?_  
          **Assistant:** _At 7 AM tomorrow in Dhaka, visibility may drop to 500 meters due to fog. Plan accordingly._

        3. **User:** _Compare sunrise temperatures today versus tomorrow in Rangpur._  
          **Assistant:** _Today’s sunrise was 22°C, while tomorrow’s is forecast at 24°C._

        4. **User:** _Tell me about the weather on Feb 30 in Khulna._  
          **Assistant:** _Invalid date: February 30 doesn’t exist. Please provide a valid date (e.g., February 28)._

        5. **User:** _What’s the rain probability in NowhereCity?_  
          **Assistant:** _I couldn’t find weather data for ‘NowhereCity.’ Please check the city name or provide a more specific location._

        6. **User:** _Give me tomorrow’s weather._  
          **Assistant:** _Sorry, I can’t fetch data right now due to a service issue. Please try again later._

        7. **User:** _What about the day after that?_  
          **Assistant:** _The May 6 forecast in Dhaka: partly cloudy, high of 33°C._

        8. **User:** _Was it raining two days before yesterday?_  
          **Assistant:** _Two days before yesterday (May 1), Rajshahi had 4mm of rain._

        9. **User:** _How did that compare to four days ago?_  
          **Assistant:** _Four days ago (April 30), Rajshahi had 0mm of rain—so May 1 was wetter._

        10. **User:** _Woohoo! Will it be sunny tomorrow so I can hit the beach?_  
            **Assistant:** _Sounds exciting! Yes, tomorrow will be sunny with highs of 32°C—perfect beach weather._

        11. **User:** _Ugh, will it drizzle again? I hate wet shoes._  
            **Assistant:** _I understand your frustration, but there’s only a 10% chance of light drizzle today, so you should stay dry._
          `,
    },
    ...state.messages,
  ]);

  return {
    messages: [result],
  };
};

const toolNode = new ToolNode(tools);

const shouldContinue = (state) => {
  const messages = state.messages;
  const lastMessage = messages.at(-1);

  // If the LLM makes a tool call, then perform an action
  if (lastMessage?.tool_calls?.length) {
    return "Action";
  }
  // Otherwise, we stop (reply to the user)
  return "__end__";
};

const agentBuilder = new StateGraph(MessagesAnnotation)
  .addNode("LLM", llmCall)
  .addNode("Tool", toolNode)
  .addEdge("__start__", "LLM")
  .addConditionalEdges("LLM", shouldContinue, {
    Action: "Tool",
    __end__: "__end__",
  })
  .addEdge("Tool", "LLM")
  .compile();

// take input from the user and run the agent
export const runAgent = async (user, input, history) => {
  const time = new Date().toISOString();
  const initialState = {
    messages: [
      ...history,
      {
        role: "user",
        // give userinformation to the agent then give the input message
        content: `User: ${user.name}, Home Location: ${user.location}, Current Time: ${time}\nQuery: ${input}`,
      },
    ],
  };
  console.log("Initial State:", initialState);

  const result = await agentBuilder.invoke(initialState);
  return result.messages[result.messages.length - 1].content;
};

// const input =
//   "Will it rain today in New York? What about tomorrow? How about yesterday?";

// runAgent(input)
//   .then((result) => {
//     // Print only the last message's content as the main output
//     // if (Array.isArray(result.messages)) {

//       console.log("Result:", result);
//     // } else {
//     //   // Fallback for previous implementation
//     //   const lines = result.split("\n");
//     //   console.log("Result:", lines[lines.length - 1]);
//     // }
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
