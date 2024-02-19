class Api::V1::UsersController < ApplicationController
    before_action :getUser, only: [:updateUser, :deleteUser, :showUser]

    # before_action only: [:updateUser, :deleteUser] do
    #     check_token(2)
    # end

    # get
    def getUsers
        user = User.all
        if user
            render json: user, status: :ok
        else
            render json: { msg: "Users Empty"}, status: :ok
        end
    end

    # post
    def addUser
        
        user = User.new(userparams)
        print "This is a test"
        user.type = 2; #evrytime a user is created, type will be default as 2

        if user.save()
            render json: user, status: :ok
        else
            render json:  { msg: "User not added", error: user.errors}, status: :ok
        end
    end

    # show
    def showUser
        if @user
            render json: @user, status: :ok
        else
            render json: {msg: "User not Found"}, status: :ok
        end
    end

    # put
    def updateUser
        if @user
            if @user.update(userparams)
                render json: @user, status: :ok
            else
                render json: { msg: "Update Failed", error: @user.errors}, status: :ok
            end
        else
            render json: {msg: "User not Found"}, status: :ok
        end
    end

    # delete
    def deleteUser
        if @user
            if @user.destroy(userparams)
                render json: { msg: "User Deleted"}, status: :ok
            else
                render json: { msg: "Update Failed"}, status: :unprocessable_entity
            end
        else
            render json: {msg: "User not Found"}, status: :ok
        end
    end

    private 
        def userparams
            params.permit(:fullname, :email, :password);
        end

        def getUser
            # @user = User.find(params[:id])
            @user = User.find_by(:email => params[:email])
        end
end
