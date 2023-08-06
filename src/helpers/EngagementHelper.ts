import Highcharts from "highcharts";
import { TooltipFormatterContextObject } from "highcharts";

interface Message {
    count: string;
    timeBucket: string;
    channelId: string;
}

interface Channel {
    id: string;
    name: string;
}

class EngagementHelper {

    // Filter Channels with messages for more than one date
    private static filterChannelsWithMultipleDates(messageCountList: Message[], channels: Channel[]) {
        const channelCounts: { [channelId: string]: number } = {};

        for (const message of messageCountList) {
            channelCounts[message.channelId] = (channelCounts[message.channelId] || 0) + 1;
        }

        return channels.filter((channel) => channelCounts[channel.id] > 1);
    }

    // Generate data series for the graph to show channel name with messages count
    private static processMessageCountList(messageCountList: Message[], channels: Channel[]) {
        const channelData: { name: string; data: [number, number][], type: string }[] = [];

        for (const channel of channels) {
            const channelMessages = messageCountList.filter((message) => message.channelId === channel.id);
            const data: [number, number][] = [];

            for (const message of channelMessages) {
                const date = new Date(message.timeBucket).getTime();
                const count = parseInt(message.count, 10);
                data.push([date, count]);
            }

            channelData.push({
                name: channel.name,  // Set the series name as the channel name
                data: data, // Provide the data for the series
                type: "spline" // Set type to "spline" for a curvy line graph
            });
        }

        return channelData;
    }

    public static engagementMessageOverTimeChartOptions(
        messageCountList: Message[],
        channels: Channel[]
    ) {
        const filteredChannels = this.filterChannelsWithMultipleDates(messageCountList, channels);
        const channelData = this.processMessageCountList(messageCountList, filteredChannels);

        return {
            title: {
                text: "Engagement: Messages Over Time",
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "Date",
                },
                tickInterval: 24 * 3600 * 1000, // Set tick interval to 24 hours (1 day)

            },
            yAxis: {
                title: {
                    text: "Message Count",
                },
            },
            tooltip: {
                pointFormatter: function (this: TooltipFormatterContextObject) {
                    if (typeof this.x === "number") {
                        const date = new Date(this.x).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                        });
                        return `<b>${this.series.name}</b><br/>${this.y} messages on ${date}`;
                    } else {
                        return `<b>${this.series.name}</b><br/>${this.y} messages on N/A`;
                    }
                },
                headerFormat: ''
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                x: 0,
                y: 0
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false,
                    },
                },
            },
            series: channelData
        };
    }
}

export default EngagementHelper;
