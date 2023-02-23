import Timeline from '@mui/lab/Timeline';
import timelineItemClasses from '@mui/lab/TimelineItem/timelineItemClasses';
import Box from '@mui/material/Box';

import { UserWordPress } from '../../types';
import PostItem from './PostItem';

type PostLineProps = {
  targetWp: UserWordPress;
};

const PostsLine: React.FC<PostLineProps> = (props) => {
  const { targetWp } = props;

  return (
    <Box>
      <Box sx={{ width: '100%' }}>
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {targetWp.posts.map((post) => {
            return (
              <PostItem
                post={post}
                categories={targetWp.categories}
                tags={targetWp.tags}
                key={post.id}
              />
            );
          })}
        </Timeline>
      </Box>
    </Box>
  );
};

export default PostsLine;
