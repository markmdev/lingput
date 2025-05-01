import { Story } from "../types/ApiObjects";
import StoryComponent from "./Story";

export default function StoryList({ storyList = [] }: { storyList?: Story[] }) {
  console.log(storyList);
  return storyList.map((story) => <StoryComponent key={story.id} story={story} />);
}
