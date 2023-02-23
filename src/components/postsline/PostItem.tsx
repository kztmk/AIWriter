import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Typography from '@mui/material/Typography';
import parse from 'html-react-parser';
import { Category, Post, Tag } from '../../types';

type TimelineItemProps = {
  post: Post;
  categories: Category[];
  tags: Tag[];
};

const PostItem = (props: TimelineItemProps) => {
  const { post, categories, tags } = props;

  const taxonomyToText = (args: { taxonomyOfPost: number[]; type: string }) => {
    let text = '';
    let selectFrom;

    if (args.type === 'category') {
      selectFrom = categories;
    } else {
      selectFrom = tags;
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < args.taxonomyOfPost.length; i++) {
      const element = categories.find((c) => c.id === args.taxonomyOfPost[i]);
      if (element) {
        text += `${element.name}/`;
      }
    }

    return text.replace(/\/$/, '');
  };

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot>
          <DescriptionOutlinedIcon color="secondary" />
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h5" component="h4">
          {post.title.rendered}
        </Typography>
        <Typography variant="subtitle1">{post.date}</Typography>
        <Typography variant="subtitle2">
          {taxonomyToText({ taxonomyOfPost: post.categories, type: 'category' })}
        </Typography>
        <Typography variant="body1">{parse(post.content.rendered)}</Typography>
        <Typography variant="body2">
          {taxonomyToText({ taxonomyOfPost: post.tags, type: 'tag' })}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

export default PostItem;
