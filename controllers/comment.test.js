import { jest } from '@jest/globals';
import commentController from './comment.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { getIO } from '../utils/socket.js';
import formatDate from '../utils/time.js';

jest.mock('../models/User.js');
jest.mock('../models/Comment.js');
jest.mock('../models/Post.js');
jest.mock('../models/Notification.js');
jest.mock('../utils/socket.js');
jest.mock('../utils/time.js');

describe('commentController', () => {
    let req, res, next, io;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { _id: 'userId' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        io = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis()
        };
        getIO.mockReturnValue(io);
    });

    describe('addComment', () => {
        it('should add a comment and return 201 status', async () => {
            req.body.content = 'Test comment';
            req.params.postId = 'postId';
            const user = { _id: 'userId', firstName: 'John', lastName: 'Doe' };
            const comment = { _id: 'commentId', save: jest.fn() };
            const populatedComment = { _id: 'commentId', author: { profilePic: { key: 'profilePicKey' } } };
            const updatedPost = { commentCount: 1 };
            const notification = { _id: 'notificationId', save: jest.fn() };

            User.findById.mockResolvedValue(user);
            Comment.mockImplementation(() => comment);
            Comment.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(populatedComment) });
            Post.findByIdAndUpdate.mockResolvedValue(updatedPost);
            Notification.mockImplementation(() => notification);
            formatDate.mockReturnValue('formattedTime');

            await commentController.addComment(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('userId');
            expect(comment.save).toHaveBeenCalled();
            expect(Notification).toHaveBeenCalledWith({
                userId: 'userId',
                message: 'Comment added',
                isRead: false,
                Time: 'formattedTime'
            });
            expect(notification.save).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('postId', { $inc: { commentCount: 1 } }, { new: true });
            expect(io.emit).toHaveBeenCalledWith('commentAdd', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 201, status: true, message: 'Commment posted successfully!' }));
        });

        it('should handle errors', async () => {
            const error = new Error('Test error');
            User.findById.mockRejectedValue(error);

            await commentController.addComment(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('replyToComment', () => {
        it('should reply to a comment and return 201 status', async () => {
            req.body.content = 'Test reply';
            req.params.postId = 'postId';
            req.params.commentId = 'commentId';
            const user = { _id: 'userId', firstName: 'John', lastName: 'Doe' };
            const parentComment = { _id: 'commentId', author: 'authorId', replies: [], save: jest.fn() };
            const parentAuthor = { _id: 'authorId', firstName: 'Jane', lastName: 'Doe' };
            const reply = { _id: 'replyId', save: jest.fn() };
            const populatedReply = { _id: 'replyId', author: { profilePic: { key: 'profilePicKey' } } };
            const notification = { _id: 'notificationId', save: jest.fn() };

            User.findById.mockResolvedValueOnce(user).mockResolvedValueOnce(parentAuthor);
            Comment.findById.mockResolvedValue(parentComment);
            Comment.mockImplementation(() => reply);
            Comment.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(populatedReply) });
            Notification.mockImplementation(() => notification);
            formatDate.mockReturnValue('formattedTime');

            await commentController.replyToComment(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('userId');
            expect(User.findById).toHaveBeenCalledWith('authorId');
            expect(reply.save).toHaveBeenCalled();
            expect(parentComment.save).toHaveBeenCalled();
            expect(Notification).toHaveBeenCalledWith({
                userId: 'authorId',
                message: 'John Doe mentioned you in a reply',
                isRead: false,
                Time: 'formattedTime'
            });
            expect(notification.save).toHaveBeenCalled();
            expect(io.emit).toHaveBeenCalledWith('replyAdd', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 201, status: true, message: 'Reply added' }));
        });

        it('should handle errors', async () => {
            const error = new Error('Test error');
            User.findById.mockRejectedValue(error);

            await commentController.replyToComment(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // Similar tests for replyToReply, getComments, getCommentCount, deleteComment
});import { jest } from '@jest/globals';
import commentController from './comment.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { getIO } from '../utils/socket.js';
import formatDate from '../utils/time.js';

jest.mock('../models/User.js');
jest.mock('../models/Comment.js');
jest.mock('../models/Post.js');
jest.mock('../models/Notification.js');
jest.mock('../utils/socket.js');
jest.mock('../utils/time.js');

describe('commentController', () => {
    let req, res, next, io;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { _id: 'userId' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        io = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis()
        };
        getIO.mockReturnValue(io);
    });

    describe('addComment', () => {
        it('should add a comment and return 201 status', async () => {
            req.body.content = 'Test comment';
            req.params.postId = 'postId';
            const user = { _id: 'userId', firstName: 'John', lastName: 'Doe' };
            const comment = { _id: 'commentId', save: jest.fn() };
            const populatedComment = { _id: 'commentId', author: { profilePic: { key: 'profilePicKey' } } };
            const updatedPost = { commentCount: 1 };
            const notification = { _id: 'notificationId', save: jest.fn() };

            User.findById.mockResolvedValue(user);
            Comment.mockImplementation(() => comment);
            Comment.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(populatedComment) });
            Post.findByIdAndUpdate.mockResolvedValue(updatedPost);
            Notification.mockImplementation(() => notification);
            formatDate.mockReturnValue('formattedTime');

            await commentController.addComment(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('userId');
            expect(comment.save).toHaveBeenCalled();
            expect(Notification).toHaveBeenCalledWith({
                userId: 'userId',
                message: 'Comment added',
                isRead: false,
                Time: 'formattedTime'
            });
            expect(notification.save).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('postId', { $inc: { commentCount: 1 } }, { new: true });
            expect(io.emit).toHaveBeenCalledWith('commentAdd', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 201, status: true, message: 'Commment posted successfully!' }));
        });

        it('should handle errors', async () => {
            const error = new Error('Test error');
            User.findById.mockRejectedValue(error);

            await commentController.addComment(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // Similar tests for replyToComment, replyToReply, getComments, getCommentCount, deleteComment
});